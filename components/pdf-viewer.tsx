"use client";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin, RenderZoomOutProps, RenderZoomInProps, RenderCurrentScaleProps } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function PDFViewerPage() {
    const { chatId } = useParams();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { GoToFirstPage, GoToPreviousPage, CurrentPageInput, GoToNextPage, GoToLastPage, NumberOfPages } = pageNavigationPluginInstance;
    const zoomPluginInstance = zoomPlugin({ enableShortcuts: true });
    const { ZoomIn, ZoomOut, CurrentScale, zoomTo } = zoomPluginInstance;

    return (
        <div className="w-full h-screen flex flex-col bg-white">
            {/* Toolbar minimaliste */}
            <div className="flex justify-center items-center gap-1 p-6 bg-white border-b border-gray-100">
                
                {/* Navigation pages */}
                <div className="flex items-center gap-1 mr-8">
                    <GoToFirstPage>
                        {(props) => (
                            <Button 
                                onClick={props.onClick} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        )}
                    </GoToFirstPage>

                    <GoToPreviousPage>
                        {(props) => (
                            <Button 
                                onClick={props.onClick} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                    </GoToPreviousPage>

                    <div className="flex items-center gap-2 mx-3">
                        <CurrentPageInput />
                        <span className="text-sm text-gray-400 font-light">/ <NumberOfPages /></span>
                    </div>

                    <GoToNextPage>
                        {(props) => (
                            <Button 
                                onClick={props.onClick} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </GoToNextPage>

                    <GoToLastPage>
                        {(props) => (
                            <Button 
                                onClick={props.onClick} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        )}
                    </GoToLastPage>
                </div>

                {/* Contrôles zoom */}
                <div className="flex items-center gap-1">
                    <ZoomOut>
                        {(props: RenderZoomOutProps) => (
                            <Button
                                onClick={props.onClick}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        )}
                    </ZoomOut>

                    <CurrentScale>
                        {(props: RenderCurrentScaleProps) => (
                            <div className="px-3 py-1 text-sm font-medium text-gray-600 min-w-[60px] text-center">
                                {Math.round(props.scale * 100)}%
                            </div>
                        )}
                    </CurrentScale>

                    <ZoomIn>
                        {(props: RenderZoomInProps) => (
                            <Button
                                onClick={props.onClick}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </ZoomIn>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-50/30">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer 
                        fileUrl={`/api/viewer/${chatId}`}
                        plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
                    />
                </Worker>
            </div>
        </div>
    );
}