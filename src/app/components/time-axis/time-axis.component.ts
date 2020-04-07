import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import {
  getDoyTimestamp,
  getDoyTimestampFromSvgMousePosition,
  hideTooltip,
  showTooltip,
} from '../../functions';
import { TimeRange } from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-time-axis',
  styleUrls: ['./time-axis.component.css'],
  templateUrl: `./time-axis.component.html`,
})
export class TimeAxisComponent implements AfterViewInit, OnChanges {
  @Input()
  height = 50;

  @Input()
  marginLeft = 70;

  @Input()
  marginRight = 70;

  @Input()
  marginTop = 10;

  @Input()
  maxTimeRange: TimeRange = { start: 0, end: 0 };

  @Input()
  viewTimeRange: TimeRange = { start: 0, end: 0 };

  @Output()
  updateViewTimeRange: EventEmitter<TimeRange> = new EventEmitter<TimeRange>();

  @ViewChild('brush', { static: true })
  brush: ElementRef<SVGGElement>;

  @ViewChild('timeAxis', { static: true })
  timeAxis: ElementRef<SVGGElement>;

  @ViewChild('yearDayAxis', { static: true })
  yearDayAxis: ElementRef<SVGGElement>;

  public drawHeight: number = this.height;
  public drawWidth: number;
  public marginBottom = 10;
  public tickSize = 0;

  constructor(private elRef: ElementRef) {
    this.elRef.nativeElement.style.setProperty('--height', `${this.height}px`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let shouldRedraw = false;
    this.setDrawBounds();

    if (changes.maxTimeRange && !changes.maxTimeRange.isFirstChange()) {
      shouldRedraw = true;
    }

    if (changes.viewTimeRange && !changes.viewTimeRange.isFirstChange()) {
      shouldRedraw = true;
    }

    if (shouldRedraw) {
      this.redraw();
    }
  }

  ngAfterViewInit(): void {
    d3.select(this.brush.nativeElement).on('mousemove', () => {
      this.showTooltip(d3.event);
    });

    d3.select(this.brush.nativeElement).on('mouseleave', () => {
      hideTooltip();
    });

    this.redraw();
  }

  drawAxisLabel(
    axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    className: string,
    labelText: string,
  ): void {
    axisGroup.selectAll(`.${className}`).remove();
    const axisLabel = axisGroup.append('g').attr('class', className);
    axisLabel.selectAll('*').remove();
    axisLabel
      .append('text')
      .attr('y', 0)
      .attr('x', -60)
      .attr('dy', '1em')
      .attr('fill', 'rgba(0, 0, 0, 0.38)')
      .attr('font-size', `10px`)
      .attr('font-style', 'italic')
      .style('text-transform', 'uppercase')
      .text(labelText);
  }

  drawTimeAxis(): void {
    const x = this.getXScale();
    const axisGroup = d3.select(this.timeAxis.nativeElement);
    const axis = d3
      .axisBottom(x)
      .tickFormat((date: Date) =>
        getDoyTimestamp(date.getTime(), false).split('T').pop(),
      )
      .tickSize(this.tickSize);
    axisGroup.call(axis);
    axisGroup.selectAll('.domain').remove();
    axisGroup
      .selectAll('text')
      .style('pointer-events', 'none')
      .style('user-select', 'none');
    this.drawAxisLabel(axisGroup, 'time-axis', 'Time');
  }

  drawYearDayAxis(): void {
    const x = this.getXScale();
    const ticks: Date[] = Object.values(
      // Build a map of unique ticks for each year/day-of-year.
      // Any duplicate ticks after the first year/day-of-year will be ignored.
      x.ticks().reduce((dates, date) => {
        const yearDay = getDoyTimestamp(date.getTime()).split('T')[0];
        if (dates[yearDay] === undefined) {
          dates[yearDay] = date;
        }
        return dates;
      }, {}),
    );
    const axisGroup = d3.select(this.yearDayAxis.nativeElement);
    const axis = d3
      .axisBottom(x)
      .tickValues(ticks)
      .tickFormat((date: Date) => getDoyTimestamp(date.getTime()).split('T')[0])
      .tickSize(this.tickSize);
    axisGroup.call(axis);
    axisGroup.selectAll('.domain').remove();
    axisGroup
      .selectAll('text')
      .style('pointer-events', 'none')
      .style('user-select', 'none');
    this.drawAxisLabel(axisGroup, 'year-day-axis', 'Year-Day');
  }

  drawBrush(): void {
    const xBrush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.drawWidth, this.drawHeight],
      ])
      .on('start', () => {
        this.showTooltip(d3.event.sourceEvent);
      })
      .on('brush', () => {
        this.showTooltip(d3.event.sourceEvent);
      })
      .on('end', () => {
        this.brushEnd();
      });

    const brush = d3.select(this.brush.nativeElement).call(xBrush);
    brush.call(xBrush.move, null);
  }

  getDomain(): Date[] {
    return [
      new Date(this.viewTimeRange.start),
      new Date(this.viewTimeRange.end),
    ];
  }

  getXScale(): d3.ScaleTime<number, number> {
    return d3.scaleTime().domain(this.getDomain()).range([0, this.drawWidth]);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.resize();
  }

  resize(): void {
    this.redraw();
  }

  redraw(): void {
    this.setDrawBounds();
    this.drawTimeAxis();
    this.drawYearDayAxis();
    this.drawBrush();
  }

  setDrawBounds(): void {
    this.drawHeight = this.height - this.marginTop - this.marginBottom;
    this.drawWidth =
      this.elRef.nativeElement.clientWidth - this.marginLeft - this.marginRight;
  }

  showTooltip(event: MouseEvent | null): void {
    if (event) {
      const xScale = this.getXScale();
      const doyTimestamp = getDoyTimestampFromSvgMousePosition(
        this.brush.nativeElement,
        event,
        xScale,
      );
      showTooltip(event, doyTimestamp, this.drawWidth); // Not recursive!
    }
  }

  brushEnd(): void {
    if (!d3.event.sourceEvent) {
      return;
    }
    if (!d3.event.selection) {
      return;
    }

    const x = this.getXScale();
    const [start, end] = d3.event.selection.map(x.invert);

    this.updateViewTimeRange.emit({
      end: end.getTime(),
      start: start.getTime(),
    });
  }
}

@NgModule({
  declarations: [TimeAxisComponent],
  exports: [TimeAxisComponent],
})
export class TimeAxisModule {}
