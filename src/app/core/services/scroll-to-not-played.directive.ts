import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { ScrollService } from './scroll.service';

@Directive({
  selector: '[appScrollToNotPlayed]'
})
export class ScrollToNotPlayedDirective implements AfterViewInit {

  @Input() played!: string;

  constructor(private el: ElementRef, private scrollService: ScrollService) { }

  ngAfterViewInit() {
    if (this.played === 'no' && !this.scrollService.hasScrolled) {
      this.el.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.scrollService.hasScrolled = true;
    }
  }

}
