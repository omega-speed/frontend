"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { declareAttribute } from "../service";
import type { CatalogField } from "../catalog";

const LABEL_CLS = "text-[11px] uppercase text-muted-foreground";

export function EditAttributeDialog({
  field,
  currentValue,
  open,
  onOpenChange,
  onSaved,
}: {
  field: CatalogField;
  currentValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  // The parent mounts this fresh each time a field is opened, so initializing
  // from `currentValue` is enough — no reset effect needed.
  const [value, setValue] = useState(currentValue);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Enter a value first.");
      return;
    }
    setSaving(true);
    const res = await declareAttribute({
      category: field.category,
      name: field.name,
      value: trimmed,
    });
    setSaving(false);
    if (!res?.success) {
      toast.error(res?.message ?? "Could not save.");
      return;
    }
    toast.success("Saved.");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-black">{field.label}</DialogTitle>
          <DialogDescription>
            Saved as your own answer — shown as &ldquo;You said&rdquo;. You can
            change it anytime, and we keep the history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1 py-2">
          <span className={LABEL_CLS}>{field.label}</span>
          {field.options ? (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={field.placeholder}
              className="h-10"
              autoFocus
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
