import { useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";

type ReadOnlyGridspaceCanvasProps = {
    pathsJson: string;
    height?: string;
};

type SketchCanvasPaths = Parameters<ReactSketchCanvasRef["loadPaths"]>[0];

export default function ReadOnlyGridspaceCanvas({
    pathsJson,
    height = "400px",
}: ReadOnlyGridspaceCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPaths() {
            if (!canvasRef.current) return;

            try {
                setLoadError(null);

                const parsedPaths = JSON.parse(pathsJson) as SketchCanvasPaths;

                await canvasRef.current.clearCanvas();
                await canvasRef.current.loadPaths(parsedPaths);
            } catch (error) {
                console.error("Failed to load synced gridspace paths:", error);
                setLoadError("Could not load this gridspace.");
            }
        }

        void loadPaths();
    }, [pathsJson]);

    return (
        <div className="readonly-gridspace-canvas">
            {loadError && <p className="error-text">{loadError}</p>}

            <div className="readonly-canvas-blocker">
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeWidth={3}
                    strokeColor="#000000"
                    canvasColor="#ffffff"
                    style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "16px",
                        pointerEvents: "none",
                    }}
                    width="100%"
                    height={height}
                />
            </div>
        </div>
    );
}