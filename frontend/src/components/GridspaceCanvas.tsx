import { useEffect, useRef } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";

type GridspaceCanvasProps = {
    storageKey: string;
    height?: string;
};

export default function GridspaceCanvas({
    storageKey,
    height = "400px",
}: GridspaceCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);

    async function saveCanvas() {
        if (!canvasRef.current) return;

        const paths = await canvasRef.current.exportPaths();

        localStorage.setItem(storageKey, JSON.stringify(paths));
    }

    async function loadCanvas() {
        if (!canvasRef.current) return;

        const saved = localStorage.getItem(storageKey);

        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);

            await canvasRef.current.loadPaths(parsed);
        } catch (err) {
            console.error("Failed to load canvas", err);
        }
    }

    useEffect(() => {
        void loadCanvas();
    }, []);

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
                onStroke={saveCanvas}
            />

            <div className="canvas-actions">
                <button
                    onClick={() => {
                        void canvasRef.current?.undo();
                        setTimeout(saveCanvas, 50);
                    }}
                >
                    Undo
                </button>

                <button
                    onClick={() => {
                        void canvasRef.current?.clearCanvas();
                        localStorage.removeItem(storageKey);
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}