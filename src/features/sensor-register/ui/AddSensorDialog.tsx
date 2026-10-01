import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { FieldHelper } from "@/shared/ui/field-helper";
import { showToast } from "@/shared/lib/toast";
import { useRegisterSensor } from "@/entities/sensor/api/use-register-sensor";
import {
  SensorRegistrationError,
  type SensorRegistration,
} from "@/entities/sensor/api/register-sensor";

interface AddSensorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Os três valores de ativação OTAA, na ordem em que aparecem no ChirpStack.
 *
 * TODO — validação de formato ainda não decidida. No LoRaWAN o DevEUI e o
 * AppEUI têm 8 bytes (16 caracteres hex) e o AppKey tem 16 bytes (32), e as
 * chaves costumam vir copiadas com espaços ou dois-pontos entre os octetos.
 * Por ora o formulário só exige que os três estejam preenchidos; quando a
 * regra for definida, ela entra aqui e no `podeEnviar` abaixo.
 */
const CAMPOS: { id: keyof SensorRegistration; label: string; ajuda: string }[] = [
  {
    id: "devEUI",
    label: "DevEUI",
    ajuda: "Identificador de fábrica do aparelho. Não muda nunca.",
  },
  {
    id: "appEUI",
    label: "AppEUI",
    ajuda: "Identificador da aplicação no network server. Também chamado de JoinEUI.",
  },
  {
    id: "appKey",
    label: "AppKey",
    ajuda: "Chave de ativação do dispositivo. Vem junto com o sensor.",
  },
];

const VAZIO: SensorRegistration = { devEUI: "", appEUI: "", appKey: "" };

const mensagemDeErro = (erro: unknown): { titulo: string; corpo: string } => {
  // Cada caso diz se o problema é do produtor ou da configuração. Sem essa
  // distinção ele lê "erro" e supõe que digitou algo errado.
  if (SensorRegistrationError.is(erro)) {
    switch (erro.kind) {
      case "duplicado":
        return {
          titulo: "Sensor já cadastrado",
          corpo: "Este DevEUI já está na sua conta. Nada foi alterado.",
        };
      case "nao-configurado":
      case "nao-autorizado":
        return {
          titulo: "Cadastro indisponível",
          corpo:
            "O servidor de cadastro recusou a gravação. Os dados não foram salvos.",
        };
      case "formato-desconhecido":
        return {
          titulo: "Cadastro indisponível",
          corpo:
            "Sua lista de sensores está num formato que não reconhecemos. Nada foi alterado.",
        };
    }
  }
  if (erro instanceof TypeError) {
    // fetch() rejeita com TypeError quando não chega a falar com o servidor.
    return {
      titulo: "Sem conexão com o servidor",
      corpo: "Verifique sua internet e tente de novo.",
    };
  }
  return {
    titulo: "Não foi possível cadastrar",
    corpo: "Tente de novo em alguns instantes.",
  };
};

export const AddSensorDialog = ({ open, onOpenChange }: AddSensorDialogProps) => {
  const [valores, setValores] = useState<SensorRegistration>(VAZIO);
  const registrar = useRegisterSensor();

  // Cada abertura começa limpa, inclusive sem o erro da tentativa anterior —
  // senão o modal reabre acusando uma falha que o usuário já leu e fechou.
  useEffect(() => {
    if (open) {
      setValores(VAZIO);
      registrar.reset();
    }
    // `registrar` muda de identidade a cada render do hook; depender dele aqui
    // faria o efeito rodar em loop e limpar o formulário enquanto se digita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const podeEnviar =
    CAMPOS.every(({ id }) => valores[id].trim() !== "") && !registrar.isPending;

  const handleSubmit = async () => {
    if (!podeEnviar) return;
    try {
      await registrar.mutateAsync({
        devEUI: valores.devEUI.trim(),
        appEUI: valores.appEUI.trim(),
        appKey: valores.appKey.trim(),
      });
      showToast.success("Sensor cadastrado.", {
        description: "Ele aparece no painel assim que enviar a primeira leitura.",
      });
      onOpenChange(false);
    } catch {
      // O erro fica visível dentro do modal, em `registrar.error`. Nada de
      // fechar: o usuário perderia o que digitou.
    }
  };

  const erro = registrar.error ? mensagemDeErro(registrar.error) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar sensor</DialogTitle>
          <DialogDescription>
            Informe os dados de ativação que vieram com o aparelho.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {CAMPOS.map(({ id, label, ajuda }) => (
            <div key={id}>
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                value={valores[id]}
                onChange={(e) => setValores((v) => ({ ...v, [id]: e.target.value }))}
                disabled={registrar.isPending}
                autoComplete="off"
                spellCheck={false}
                className="mt-1.5 font-mono"
              />
              <FieldHelper>{ajuda}</FieldHelper>
            </div>
          ))}

          {erro && (
            <Alert tone="alert" icon={AlertTriangle} title={erro.titulo}>
              {erro.corpo}
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={registrar.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!podeEnviar}>
              {registrar.isPending ? "Cadastrando…" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
