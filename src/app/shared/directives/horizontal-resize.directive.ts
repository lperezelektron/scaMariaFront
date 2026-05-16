import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appHorizontalResize]',
  standalone: true,
  host: { class: 'resize-handle-directive' },
})
export class HorizontalResizeDirective implements OnDestroy {
  @Input('appHorizontalResize') container!: HTMLElement;
  @Input() resizeMin = 20;
  @Input() resizeMax = 80;

  private dragging = false;
  private startX = 0;
  private startLeftPct = 0;

  // Mouse
  private readonly onMouseMove = (e: MouseEvent) => this.handleMove(e.clientX);
  private readonly onMouseUp   = () => this.stopDrag();

  // Touch
  private readonly onTouchMove = (e: TouchEvent) => {
    if (!this.dragging) return;
    e.preventDefault(); // evita scroll durante el drag
    this.handleMove(e.touches[0].clientX);
  };
  private readonly onTouchEnd = () => this.stopDrag();

  constructor(private el: ElementRef<HTMLElement>) {}

  // ── Mouse ───────────────────────────────────────────────────

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.startDrag(e.clientX);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup',   this.onMouseUp);
    document.body.style.cursor = 'col-resize';
  }

  // ── Touch ────────────────────────────────────────────────────

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.startDrag(e.touches[0].clientX);
    // passive: false es necesario para poder llamar preventDefault en touchmove
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend',    this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
  }

  // ── Lógica compartida ────────────────────────────────────────

  private startDrag(clientX: number) {
    this.dragging      = true;
    this.startX        = clientX;
    this.startLeftPct  = this.currentLeftPct();
    document.body.style.userSelect = 'none';
  }

  private handleMove(clientX: number) {
    if (!this.dragging) return;
    const containerW = this.container.offsetWidth;
    if (!containerW) return;

    const dx       = clientX - this.startX;
    const deltaPct = (dx / containerW) * 100;
    const newLeft  = Math.min(this.resizeMax, Math.max(this.resizeMin, this.startLeftPct + deltaPct));
    this.applyColumns(newLeft);
  }

  private stopDrag() {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup',   this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend',    this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
  }

  private currentLeftPct(): number {
    const inline = this.container.style.gridTemplateColumns;
    if (inline) {
      const match = inline.match(/^([\d.]+)%/);
      if (match) return parseFloat(match[1]);
    }
    const cols   = getComputedStyle(this.container).gridTemplateColumns;
    const leftPx = parseFloat(cols.split(' ')[0]);
    return (leftPx / this.container.offsetWidth) * 100;
  }

  private applyColumns(leftPct: number) {
    const handlePx = this.el.nativeElement.offsetWidth || 8;
    const rightPct = 100 - leftPct;
    this.container.style.gridTemplateColumns =
      `calc(${leftPct}% - ${handlePx / 2}px) ${handlePx}px calc(${rightPct}% - ${handlePx / 2}px)`;
  }

  ngOnDestroy() {
    this.stopDrag();
  }
}
