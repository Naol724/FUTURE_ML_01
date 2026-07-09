"use client";

import { AlertCircle, CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_FILE_MB, validateCsvFile } from "@/lib/csv";
import { cn, formatCompact } from "@/lib/utils";

export interface SelectedFile {
  file: File;
  rowEstimate?: number;
}

export function UploadPanel({
  onFileAccepted,
  disabled,
  selected,
  uploadError,
}: {
  onFileAccepted: (selection: SelectedFile) => void;
  disabled?: boolean;
  selected: SelectedFile | null;
  uploadError?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setClientError(null);
      const result = await validateCsvFile(file);
      if (!result.ok) {
        setClientError(result.error ?? "Invalid file.");
        return;
      }
      onFileAccepted({ file, rowEstimate: result.rowEstimate });
    },
    [onFileAccepted],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [disabled, handleFile],
  );

  const error = clientError ?? uploadError;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload sales history</CardTitle>
        <CardDescription>
          CSV with columns <code className="text-xs">date, store_nbr, onpromotion, sales</code> —
          max {MAX_FILE_MB} MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload CSV file: click or drag and drop"
          aria-disabled={disabled}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200",
            dragging
              ? "border-accent bg-accent-soft/60 scale-[1.01]"
              : "border-border hover:border-accent/60 hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          {selected ? (
            <>
              <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                <FileSpreadsheet className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">{selected.file.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(selected.file.size / 1024 / 1024).toFixed(2)} MB
                  {selected.rowEstimate ? ` · ~${formatCompact(selected.rowEstimate)} rows` : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Click or drop another file to replace it
              </p>
            </>
          ) : (
            <>
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform duration-200",
                  dragging && "scale-110",
                )}
              >
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">
                  Drop your CSV here, or <span className="text-accent">browse</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Columns are validated locally before upload
                </p>
              </div>
            </>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {selected && !error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Schema looks good — ready to upload.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
