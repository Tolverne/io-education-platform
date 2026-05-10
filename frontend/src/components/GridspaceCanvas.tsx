import { useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import {
    deleteGridspaceSnapshot,
    loadGridspaceSnapshot,
    saveGridspaceSnapshot,
} from "../lib/gridspaceStorage";

type GridspaceCanvasProps = {
    storageKey: string;
    height?: string;
};

type SketchCanvasPaths = Parameters<ReactSketchCanvasRef["loadPaths"]>[0];

export default function GridspaceCanvas({
    storageKey,
    height = "400px",
}: GridspaceCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [saveStatus, setSaveStatus] = useState<
        "idle" | "saving" | "saved" | "error"
    >("idle");

    async function saveCanvas() {
        if (!canvasRef.current) return;

        setSaveStatus("saving");

        try {
            const paths = await canvasRef.current.exportPaths();
            await saveGridspaceSnapshot(storageKey, paths);
            setSaveStatus("saved");
        } catch (error) {
            console.error("Failed to save canvas", error);
            setSaveStatus("error");
        }
    }

    async function loadCanvas() {
        if (!canvasRef.current) return;

        try {
            const saved = await loadGridspaceSnapshot(storageKey);

            if (!saved) return;

            await canvasRef.current.loadPaths(saved.paths as SketchCanvasPaths);
            setSaveStatus("saved");
        } catch (error) {
            console.error("Failed to load canvas", error);
            setSaveStatus("error");
        }
    }

    useEffect(() => {
        void loadCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    function handleUndo() {
        void canvasRef.current?.undo();

        window.setTimeout(() => {
            void saveCanvas();
        }, 50);
    }

    function handleClear() {
        void canvasRef.current?.clearCanvas();

        deleteGridspaceSnapshot(storageKey)
            .then(() => {
                setSaveStatus("idle");
            })
            .catch((error: unknown) => {
                console.error("Failed to delete canvas snapshot", error);
                setSaveStatus("error");
            });
    }

    return (
        <div className="gridspace-wrapper">
            <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={3}
                strokeColor="#000000"
                canvasColor="#ffffff"
                style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "16px",
                }}
                width="100%"
                height={height}
                onStroke={() => {
                    void saveCanvas();
                }}
            />

            <div className="canvas-actions">
                <button onClick={handleUndo}>Undo</button>

                <button onClick={handleClear}>Clear</button>

                <span className="save-status">
                    {saveStatus === "saving" && "Saving..."}
                    {saveStatus === "saved" && "Saved locally"}
                    {saveStatus === "error" && "Save error"}
                </span>
            </div>
        </div>
    );
}