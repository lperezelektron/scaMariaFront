import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-numeric-keyboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './numeric-keyboard.component.html',
    styleUrl: './numeric-keyboard.component.scss',
})
export class NumericKeyboardComponent implements OnInit {
    @Input() value = '';
    @Output() valueChange = new EventEmitter<string>();
    @Output() confirm = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<void>();

    @Input() captureMode: 'qty' | 'amount' = 'qty';
    @Output() captureModeChange = new EventEmitter<'qty' | 'amount'>();
    @Input() showModeToggle = false;

    private fresh = true;

    ngOnInit() {
        this.fresh = true;
    }

    press(key: string) {
        if (key === '⌫') {
            this.fresh = false;
            this.valueChange.emit(this.value.slice(0, -1));
            return;
        }

        if (this.fresh && key !== '.') {
            this.fresh = false;
            this.valueChange.emit(key);
            return;
        }

        this.fresh = false;

        if (key === '.' && this.value.includes('.')) return;
        if (key === '.' && !this.value) {
            this.valueChange.emit('0.');
            return;
        }
        this.valueChange.emit(this.value + key);
    }

    setMode(mode: 'qty' | 'amount') {
        if (this.captureMode === mode) return;
        this.captureModeChange.emit(mode);
        this.valueChange.emit('');
        this.fresh = true;
    }

    onConfirm() {
        this.confirm.emit(this.value);
    }

    onCancel() {
        this.cancel.emit();
    }

    readonly keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];
}
