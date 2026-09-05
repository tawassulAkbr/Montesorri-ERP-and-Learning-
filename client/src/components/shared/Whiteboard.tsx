import React, { useRef, useState, useEffect } from 'react';
import {
  Pen, Highlighter, Eraser, Circle, Square, Minus,
  RotateCcw, Download, Sparkles, Palette,
  Undo2, Stamp, Move, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ToolType = 'pen' | 'highlighter' | 'eraser' | 'line' | 'circle' | 'rectangle' | 'stamp';

const MONTESSORI_COLORS = [
  { name: 'Indigo Blue', hex: '#006B5D' },
  { name: 'Cherry Red', hex: '#EF4444' },
  { name: 'Forest Green', hex: '#10B981' },
  { name: 'Sunshine Yellow', hex: '#F59E0B' },
  { name: 'Sky Cyan', hex: '#06B6D4' },
  { name: 'Berry Purple', hex: '#8B5CF6' },
  { name: 'Bubblegum Pink', hex: '#EC4899' },
  { name: 'Chalkboard Slate', hex: '#1E293B' },
];

const KID_STAMPS = ['⭐', '🍎', '🧸', '🎈', '🎨', '🌸', '🐱', '🚀', '🌈', '🍦'];

interface WhiteboardProps {
  isTeacher?: boolean;
  onSaveSnapshot?: (dataUrl: string) => void;
  className?: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ isTeacher = true, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#006B5D');
  const [lineWidth, setLineWidth] = useState(4);
  const [selectedStamp, setSelectedStamp] = useState('⭐');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos({ x, y });

    // Save snapshot for shapes preview
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === 'stamp') {
      ctx.font = `${lineWidth * 8 + 24}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      setIsDrawing(false);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth * 4;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color + '55'; // 33% alpha
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      // Restore before previewing shape
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `montessori-whiteboard-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('pen')}
              className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Pen size={16} />
            </TooltipTrigger>
            <TooltipContent>Crayon / Pen</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('highlighter')}
              className={`p-2 rounded-lg transition-all ${tool === 'highlighter' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Highlighter size={16} />
            </TooltipTrigger>
            <TooltipContent>Translucent Highlighter</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Eraser size={16} />
            </TooltipTrigger>
            <TooltipContent>Eraser</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('circle')}
              className={`p-2 rounded-lg transition-all ${tool === 'circle' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Circle size={16} />
            </TooltipTrigger>
            <TooltipContent>Circle / Ring</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('rectangle')}
              className={`p-2 rounded-lg transition-all ${tool === 'rectangle' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Square size={16} />
            </TooltipTrigger>
            <TooltipContent>Box / Rectangle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              type="button"
              onClick={() => setTool('line')}
              className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-[#006B5D] text-white shadow-sm' : 'text-[#344054] hover:bg-slate-100'}`}
            >
              <Minus size={16} />
            </TooltipTrigger>
            <TooltipContent>Line</TooltipContent>
          </Tooltip>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          {MONTESSORI_COLORS.map(c => (
            <button
              key={c.hex}
              type="button"
              onClick={() => { setColor(c.hex); if (tool === 'eraser') setTool('pen'); }}
              title={c.name}
              className={`w-6 h-6 rounded-full transition-transform ${color === c.hex && tool !== 'eraser' ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1' : 'hover:scale-110'}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          {[2, 5, 10].map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => setLineWidth(sz)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lineWidth === sz ? 'bg-[#E6F4F1] text-[#006B5D]' : 'text-[#667085] hover:text-[#344054]'}`}
            >
              {sz === 2 ? 'Fine' : sz === 5 ? 'Medium' : 'Chunky'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearBoard} className="text-xs text-[#344054] gap-1">
            <RotateCcw size={14} /> Clear Board
          </Button>
          <Button size="sm" onClick={downloadCanvas} className="text-xs gap-1 shadow-sm">
            <Download size={14} /> Save Artwork
          </Button>
        </div>
      </div>

      {/* Montessori Stamp Stickers Strip */}
      <div className="px-4 py-2 bg-[#E6F4F1]/50 border-b border-[#B7DDD6] flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 text-xs font-semibold text-[#006B5D] whitespace-nowrap">
          <Sparkles size={14} className="text-amber-500" /> Toddler Stamp Stickers:
        </div>
        <div className="flex items-center gap-1.5">
          {KID_STAMPS.map(stamp => (
            <button
              key={stamp}
              type="button"
              onClick={() => { setSelectedStamp(stamp); setTool('stamp'); }}
              className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                tool === 'stamp' && selectedStamp === stamp
                  ? 'bg-white shadow-md scale-110 border border-[#B7DDD6]'
                  : 'bg-white/60 hover:bg-white hover:scale-105'
              }`}
            >
              {stamp}
            </button>
          ))}
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative flex-1 bg-white cursor-crosshair min-h-[440px] touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />

        {/* Live Board Watermark */}
        <div className="absolute bottom-3 right-4 pointer-events-none select-none flex items-center gap-1.5 opacity-40 text-xs font-bold text-[#667085]">
          <span>Montessori Interactive Whiteboard</span>
        </div>
      </div>
    </div>
  );
};
