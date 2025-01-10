import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Output, Renderer2, ViewChild } from '@angular/core';
import { ResizeAnchorType, ResizeDirectionType } from './resizertype';

@Component({
    selector: 'app-textbox',
    imports: [],
    templateUrl: './textbox.component.html',
    styleUrl: './textbox.component.css'
})
export class TextboxComponent implements AfterViewInit {
    @ViewChild('wrapper') wrapperRef!: ElementRef;

    @ViewChild('topBar') topBarRef!: ElementRef;

    @ViewChild('resizeCorner') resizeCornerRef!: ElementRef;

    @ViewChild('resizers') resizers!: ElementRef;

    @ViewChild('textarea') textarea!: ElementRef;

    position: { x: number, y: number } = { x: 100, y: 100 };

    size: { w: number, h: number } = { w: 150, h: 50 };

    lastPosition: { x: number, y: number };

    lastSize: { w: number, h: number };

    minSize: { w: number, h: number } = { w: 150, h: 50 };

    @Output() isDraggingTextbox = new EventEmitter<boolean>();

    constructor(@Inject(DOCUMENT) private _document: Document, private renderer2: Renderer2,
        private _el: ElementRef) { }
    ngAfterViewInit(): void {
        this._document.addEventListener('click', (e) => {
            if (e.target instanceof HTMLTextAreaElement && e.target.tagName === 'TEXTAREA') {
                this.wrapperRef.nativeElement.style.display = 'block';
                this.resizeCornerRef.nativeElement.parentNode.style.display = 'block';
                this.topBarRef.nativeElement.style.display = 'block ';
                this.textarea.nativeElement.style.border = 'none';
            }
        });
        this.renderer2.addClass(this.wrapperRef.nativeElement, 'blink-color');

        setTimeout(() => {
            this.renderer2.removeClass(this.wrapperRef.nativeElement, 'blink-color');
        }, 1500)

    }

    onInput($event) {
        const textarea = this.textarea.nativeElement;


        // Tạo một phần tử ẩn để đo kích thước nội dung
        const offscreenDiv = document.createElement('div');
        offscreenDiv.style.position = 'absolute';
        offscreenDiv.style.visibility = 'hidden';
        offscreenDiv.style.whiteSpace = 'pre-wrap';
        offscreenDiv.style.wordWrap = 'break-word';

        // Sao chép các style quan trọng từ textarea
        const computedStyle = window.getComputedStyle(textarea);
        offscreenDiv.style.font = computedStyle.font;
        offscreenDiv.style.padding = computedStyle.padding;
        offscreenDiv.style.border = computedStyle.border;
        offscreenDiv.style.lineHeight = computedStyle.lineHeight;

        // Gán nội dung của textarea vào div
        offscreenDiv.textContent = textarea.value || ''; // Nội dung
        document.body.appendChild(offscreenDiv);


        let newWidth = Math.max(offscreenDiv.offsetWidth, this.minSize.w);
        let newHeight = Math.max(offscreenDiv.offsetHeight + 15, this.minSize.h);
        // const newWidth = offscreenDiv.offsetWidth;
        // const newHeight = offscreenDiv.offsetHeight;

        // console.log(textarea.scrollWidth, textarea.scrollHeight)
        this.size = {
            w: newWidth,
            h: newHeight
        }
    }



    startDrag($event): void {
        $event.preventDefault();
        const mouseX = $event.clientX;
        const mouseY = $event.clientY;

        const positionX = this.position.x;
        const positionY = this.position.y;

        const duringDrag = (e) => {
            const dx = e.clientX - mouseX;
            const dy = e.clientY - mouseY;
            this.position = { x: positionX + dx, y: positionY + dy };
            this.lastPosition = { ...this.position };
            this.isDraggingTextbox.emit(true);
        };

        const finishDrag = (e) => {
            this._document.removeEventListener('mousemove', duringDrag);
            this._document.removeEventListener('mouseup', finishDrag);
            this.isDraggingTextbox.emit(false);
        };

        this._document.addEventListener('mousemove', duringDrag);
        this._document.addEventListener('mouseup', finishDrag);
    }

    startResize($event, anchors: ResizeAnchorType[], direction: ResizeDirectionType): void {
        $event.preventDefault();
        //lưu vị trí khi nhấn chuột
        const mouseX = $event.clientX;
        const mouseY = $event.clientY;

        //lưu vị trí ban đầu của box
        const lastX = this.position.x;
        const lastY = this.position.y;

        //lưu khí thước ban đầu của box
        const dimensionWidth = this.resizeCornerRef.nativeElement.parentNode.offsetWidth;
        const dimensionHeight = this.resizeCornerRef.nativeElement.parentNode.offsetHeight;

        const duringResize = (e) => {
            let dw = dimensionWidth;
            let dh = dimensionHeight;

            //phần này là tính toán w,h
            if (direction === 'x' || direction === 'xy') {
                if (anchors.includes('left')) {
                    dw += (mouseX - e.clientX);
                } else if (anchors.includes('right')) {
                    dw -= (mouseX - e.clientX);
                }
            }
            if (direction === 'y' || direction === 'xy') {
                if (anchors.includes('top')) {
                    dh += (mouseY - e.clientY);
                } else if (anchors.includes('bottom')) {
                    dh -= (mouseY - e.clientY);
                }
            }

            //phần này là cập nhập w,h,left,top
            if (anchors.includes('left')) {
                this.position.x = lastX + e.clientX - mouseX;
                this.size.w = Math.max(dw, this.minSize.w);
            }

            if (anchors.includes('top')) {
                this.position.y = lastY + e.clientY - mouseY;
                this.size.h = Math.max(dh, this.minSize.h);
            }

            if (anchors.includes('bottom') || anchors.includes('right')) {
                this.size.w = Math.max(dw, this.minSize.w);
                this.size.h = Math.max(dh, this.minSize.h);
            }

            this.lastSize = { ...this.size };
            this.isDraggingTextbox.emit(true);
        };

        const finishResize = (e) => {
            this._document.removeEventListener('mousemove', duringResize);
            this._document.removeEventListener('mouseup', finishResize);
            this.isDraggingTextbox.emit(false);
        };

        this._document.addEventListener('mousemove', duringResize);
        this._document.addEventListener('mouseup', finishResize);
    }

    @Output() focusEvent = new EventEmitter<TextboxComponent>();

    onFocus() {
        this.focusEvent.emit(this);
    }


    @Output() deleteEvent = new EventEmitter<TextboxComponent>();
    DeleteTextbox()
    {
        this.deleteEvent.emit(this);
    }


}
