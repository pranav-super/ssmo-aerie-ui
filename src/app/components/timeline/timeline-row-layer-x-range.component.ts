import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { quadtree, Quadtree } from 'd3-quadtree';
import { scaleOrdinal, ScaleTime } from 'd3-scale';
import {
  schemeAccent,
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from 'd3-scale-chromatic';
import { searchQuadtreeRect, tick } from '../../functions';
import {
  MouseOverPoints,
  QuadtreeRect,
  StringTMap,
  TimeRange,
  XRangeLayerColorScheme,
  XRangePoint,
} from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'aerie-timeline-row-layer-x-range',
  styles: [
    `
      canvas {
        position: absolute;
        z-index: -1;
      }
    `,
  ],
  template: `
    <canvas
      #canvas
      [attr.height]="drawHeight * dpr"
      [attr.width]="drawWidth * dpr"
      [ngStyle]="{
        height: drawHeight + 'px',
        width: drawWidth + 'px'
      }"
    ></canvas>
  `,
})
export class TimelineRowLayerXRangeComponent
  implements AfterViewInit, OnChanges {
  @Input()
  colorScheme: XRangeLayerColorScheme | undefined;

  @Input()
  drawHeight: number;

  @Input()
  drawWidth: number;

  @Input()
  id: string;

  @Input()
  maxTimeRange: TimeRange = { end: 0, start: 0 };

  @Input()
  mousemove: MouseEvent;

  @Input()
  mouseout: MouseEvent;

  @Input()
  points: XRangePoint[] | undefined;

  @Input()
  viewTimeRange: TimeRange = { end: 0, start: 0 };

  @Input()
  xScaleView: ScaleTime<number, number>;

  @Output()
  mouseOverPoints: EventEmitter<MouseOverPoints> = new EventEmitter<MouseOverPoints>();

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D;
  dpr: number = window.devicePixelRatio;
  maxXWidth: number;
  quadtree: Quadtree<QuadtreeRect>;
  visiblePointsById: StringTMap<XRangePoint> = {};

  async ngOnChanges(changes: SimpleChanges) {
    let shouldDraw = false;

    if (
      changes.drawHeight ||
      changes.drawWidth ||
      changes.points ||
      changes.viewTimeRange ||
      changes.xScaleView
    ) {
      shouldDraw = true;
    }

    if (changes.mousemove) {
      this.onMousemove(this.mousemove);
    }

    if (changes.mouseout) {
      this.onMouseout(this.mouseout);
    }

    if (shouldDraw) {
      await this.draw();
    }
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  clamp(x: number): number {
    return Math.min(Math.max(x, 0), this.drawWidth);
  }

  colorScale() {
    if (this.colorSchemeIsArray()) {
      return scaleOrdinal(this.colorScheme);
    }

    switch (this.colorScheme) {
      case 'schemeAccent':
        return scaleOrdinal(schemeAccent);
      case 'schemeCategory10':
        return scaleOrdinal(schemeCategory10);
      case 'schemeDark2':
        return scaleOrdinal(schemeDark2);
      case 'schemePaired':
        return scaleOrdinal(schemePaired);
      case 'schemePastel1':
        return scaleOrdinal(schemePastel1);
      case 'schemePastel2':
        return scaleOrdinal(schemePastel2);
      case 'schemeSet1':
        return scaleOrdinal(schemeSet1);
      case 'schemeSet2':
        return scaleOrdinal(schemeSet2);
      case 'schemeSet3':
        return scaleOrdinal(schemeSet3);
      case 'schemeTableau10':
        return scaleOrdinal(schemeTableau10);
      default:
        return scaleOrdinal(schemeTableau10);
    }
  }

  colorSchemeIsArray() {
    if (Array.isArray(this.colorScheme)) {
      return this.colorScheme.every(i => typeof i === 'string');
    }
    return false;
  }

  async draw() {
    if (this.ctx) {
      await tick();
      this.ctx.resetTransform();
      this.ctx.scale(this.dpr, this.dpr);
      this.ctx.clearRect(0, 0, this.drawWidth, this.drawHeight);

      this.quadtree = quadtree<QuadtreeRect>()
        .x(p => p.x)
        .y(p => p.y)
        .extent([
          [0, 0],
          [this.drawWidth, this.drawHeight],
        ]);
      this.visiblePointsById = {};

      this.maxXWidth = Number.MIN_SAFE_INTEGER;
      const colorScale = this.colorScale();

      for (let i = 0; i < this.points.length; ++i) {
        const point = this.points[i];
        const nextPoint = this.points[i + 1];
        const xStart = this.clamp(Math.floor(this.xScaleView(point.x)));
        const xEnd = nextPoint
          ? this.clamp(Math.floor(this.xScaleView(nextPoint.x)))
          : this.drawWidth;
        const xWidth = xEnd - xStart;
        const y = 0;

        if (xWidth > 0) {
          const { id } = point;
          this.visiblePointsById[id] = point;

          const labelText = this.getLabelText(point);
          this.ctx.fillStyle = colorScale(labelText);
          const rect = new Path2D();
          rect.rect(xStart, y, xWidth, this.drawHeight);
          this.ctx.fill(rect);
          this.ctx.stroke(rect);

          this.quadtree.add({
            height: this.drawHeight,
            id,
            width: xWidth,
            x: xStart,
            y,
          });

          if (xWidth > this.maxXWidth) {
            this.maxXWidth = xWidth;
          }

          const { textHeight, textWidth } = this.setLabelContext(point);
          if (textWidth < xWidth) {
            this.ctx.fillText(
              labelText,
              xStart + xWidth / 2 - textWidth / 2,
              this.drawHeight / 2 + textHeight / 2,
              textWidth,
            );
          }
        }
      }
    }
  }

  getLabelText(point: XRangePoint) {
    return point.label?.text || '';
  }

  onMousemove(e: MouseEvent | undefined): void {
    if (e) {
      const { offsetX: x, offsetY: y } = e;
      const { points, pointsById } = searchQuadtreeRect<XRangePoint>(
        this.quadtree,
        x,
        y,
        this.drawHeight,
        this.maxXWidth,
        this.visiblePointsById,
      );
      this.mouseOverPoints.emit({ e, points, pointsById });
    }
  }

  onMouseout(e: MouseEvent | undefined): void {
    if (e) {
      this.mouseOverPoints.emit({ e, points: [] });
    }
  }

  setLabelContext(
    point: XRangePoint,
  ): { labelText: string; textHeight: number; textWidth: number } {
    const fontSize = point.label?.fontSize || 10;
    const fontFace = point.label?.fontFace || 'Helvetica Neue';
    this.ctx.fillStyle = point.label?.color || '#000000';
    this.ctx.font = `${fontSize}px ${fontFace}`;
    const labelText = this.getLabelText(point);
    const textMetrics = this.ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    return { labelText, textHeight, textWidth };
  }
}

@NgModule({
  declarations: [TimelineRowLayerXRangeComponent],
  exports: [TimelineRowLayerXRangeComponent],
  imports: [CommonModule],
})
export class TimelineRowLayerXRangeModule {}
