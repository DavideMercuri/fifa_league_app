import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { TuiTextfieldController } from '@taiga-ui/core';
import { TUI_ARROW_DEFAULT_OPTIONS, TUI_ARROW_MODE, TUI_DEFAULT_ITEMS_HANDLERS, TUI_ITEMS_HANDLERS, TUI_MULTI_SELECT_DEFAULT_OPTIONS, TUI_MULTI_SELECT_OPTIONS, TuiArrowMode, TuiItemsHandlers, TuiMultiSelectComponent, TuiMultiSelectOptions } from '@taiga-ui/kit';

@Component({
  selector: 'app-custom-multi-select',
  templateUrl: './custom-multi-select.component.html',
  styleUrls: ['./custom-multi-select.component.less']
})

export class CustomMultiSelectComponent<T> extends TuiMultiSelectComponent<T> {

  constructor(
    control: NgControl, 
    cdr: ChangeDetectorRef, 
    @Inject(TUI_ARROW_MODE) arrowMode: TuiArrowMode, 
    @Inject(TUI_ITEMS_HANDLERS) itemsHandlers: TuiItemsHandlers<T>, 
    @Inject(TUI_MULTI_SELECT_OPTIONS) options: TuiMultiSelectOptions<T>, 
    controller: TuiTextfieldController, 
    @Inject(TUI_IS_MOBILE) isMobile: boolean) {
      super(control, cdr, arrowMode, itemsHandlers, options, controller, isMobile);
    }
}
