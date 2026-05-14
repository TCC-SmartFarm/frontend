import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useUpdateUserProfile } from "@/entities/user/api/use-update-user-profile";
import { showToast } from "@/shared/lib/toast";
import { ApiError } from "@/shared/api/api-error";

interface ProfileEditFormProps {
  initialName: string;
  initialNickname: string;
  email: string;
}

export const ProfileEditForm = ({ initialName, initialNickname, email }: ProfileEditFormProps) => {
  const [name, setName] = useState(initialName);
  const [nickname, setNickname] = useState(initialNickname);
  const updateProfile = useUpdateUserProfile();

  const dirty = name !== initialName || nickname !== initialNickname;

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync({ name, nickname });
      showToast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      const description =
        ApiError.isApiError(error) && error.status >= 400 && error.status < 500
          ? "Verifique se as permissões do Auth0 permitem essa alteração."
          : "Não foi possível salvar. Tente novamente.";
      showToast.error("Não foi possível atualizar o perfil.", { description });
    }
  };

  const handleCancel = () => {
    setName(initialName);
    setNickname(initialNickname);
  };

  return (
    <Card tone="white" padding="lg">
      <Card.Header>
        <Card.Title as="h2">Dados pessoais</Card.Title>
      </Card.Header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
            Nome completo
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            disabled={updateProfile.isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
            Apelido
          </Label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Como te chamar"
            disabled={updateProfile.isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label className="text-xs font-semibold uppercase tracking-caps text-fg-subtle">
            E-mail
          </Label>
          <Input value={email} disabled />
          <span className="text-xs text-fg-subtle">
            Para alterar o e-mail, entre em contato com o suporte.
          </span>
        </div>
      </div>
      <Card.Footer className="justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          disabled={!dirty || updateProfile.isPending}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!dirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </Card.Footer>
    </Card>
  );
};
