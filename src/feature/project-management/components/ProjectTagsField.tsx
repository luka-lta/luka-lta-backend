import { useState } from "react";
import { CheckIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/kibo-ui/tags";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useCreateProjectTag, useProjectTags } from "@/api/project-tags/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
  value: number[];
  onChange: (tagIds: number[]) => void;
}

export function ProjectTagsField({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const tags = useProjectTags();
  const createTag = useCreateProjectTag();

  const available = tags.data ?? [];
  const selected = value.map(String);

  function handleRemove(tagId: string) {
    onChange(value.filter((id) => id !== Number(tagId)));
  }

  function handleSelect(tagId: string) {
    if (selected.includes(tagId)) {
      handleRemove(tagId);
      return;
    }

    onChange([...value, Number(tagId)]);
  }

  function handleCreate() {
    const name = search.trim();

    if (name === "") {
      return;
    }

    createTag.mutate(name, {
      onSuccess: (tag) => {
        // Der Endpunkt ist idempotent: bei einem bereits vorhandenen Namen kommt
        // der bestehende Tag zurueck. Deshalb vor dem Anhaengen auf Dubletten pruefen.
        if (!value.includes(tag.tagId)) {
          onChange([...value, tag.tagId]);
        }

        setSearch("");
        toast.success(`Tag „${tag.name}“ hinzugefügt`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  return (
    <div className="space-y-2">
      <Label>Tags <span className="font-normal text-muted-foreground">(optional)</span></Label>
      <Tags>
        <TagsTrigger className="bg-card font-normal shadow-xs">
          {selected.map((tagId) => (
            <TagsValue key={tagId} onRemove={() => handleRemove(tagId)}>
              {available.find((tag) => String(tag.tagId) === tagId)?.name ?? tagId}
            </TagsValue>
          ))}
        </TagsTrigger>
        <TagsContent>
          <TagsInput placeholder="Tag suchen oder neu anlegen…" value={search} onValueChange={setSearch} />
          <TagsList>
            <TagsEmpty>
              {search.trim() === "" ? (
                "Noch keine Tags."
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  disabled={createTag.isPending}
                  onClick={handleCreate}
                >
                  {createTag.isPending ? <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="mr-2 size-3.5" />}
                  „{search.trim()}“ anlegen
                </Button>
              )}
            </TagsEmpty>
            <TagsGroup>
              {available.map((tag) => (
                <TagsItem key={tag.tagId} value={String(tag.tagId)} onSelect={handleSelect}>
                  {tag.name}
                  {selected.includes(String(tag.tagId)) && (
                    <CheckIcon className="text-muted-foreground" size={14} />
                  )}
                </TagsItem>
              ))}
            </TagsGroup>
          </TagsList>
        </TagsContent>
      </Tags>
    </div>
  );
}
