import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss']
})
export class PhotoComponent implements OnInit, AfterViewInit, OnDestroy {

  WIDTH: number = 350;
  HEIGHT: number = 500;
  minWidthList: any[] = [];
  minWidthSub: any;
  minHeigthList: any[] = [];
  minHeigthSub: any;
  newWidth: number = 30;
  newHeight: number = 30;

  @ViewChild("video")
  public video: any;

  @ViewChild("canvas")
  public canvas: any;

  @ViewChild('screen', ) screen: any;

  captures: string[] = [];
  listCarama: any[] = [];
  error: any;
  isCaptured: boolean = false;
  imagen: any;
  opacity: number = 100;

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // this.minWidth();
    // this.minHeigth();
  }

  ngOnDestroy(): void {
    this.minWidthSub.unsubscribe();
    this.minHeigthSub.unsubscribe();
  }

  updateSetting(event: any) {
    console.log(event);
    this.opacity = event.value;
  }

  async ngAfterViewInit() {
    await this.loadCameras();
    await this.setupDevices();
  }

  async loadCameras(): Promise<void> {
    const listCarama = await navigator.mediaDevices.enumerateDevices();
    this.listCarama = listCarama.filter((device: any) => device.kind === 'videoinput');
    this.listCarama.forEach((camara: any, index: number) => {
      camara.check = index === 0;
    });
  }

  async setupDevices() {
    const groupId = '';
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const select = this.listCarama.find((camera: any) => camera.check);
        
        const videoConstraints = {
          video: true,
          deviceId: { exact: select.deviceId}
        };
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
    this.imagen = this.canvas.nativeElement.toDataURL("image/png")
    this.isCaptured = true;
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, 350, 500);
  }

  escucharWidth() {
    this.minWidthSub = this.breakpointObserver.observe(this.minWidthList).subscribe((state: any) => {
      this.newWidth = 0;
      for (const key in state.breakpoints) {
        if (state.breakpoints.hasOwnProperty(key)) {
          if (state.breakpoints[key]) {
            this.newWidth++;
          } else {
            console.log(this.newWidth);
            break;
          }
        }
      }
    });
  }

  minWidth() {
    for (let i = 1; i < 1000; i++) {
      this.minWidthList.push(`(min-width: ${i}rem)`);
    }
    this.escucharWidth();
  }


  escucharHeigth() {
    this.minHeigthSub = this.breakpointObserver.observe(this.minHeigthList).subscribe((state: any) => {
      this.newHeight = 0;
      for (const key in state.breakpoints) {
        if (state.breakpoints.hasOwnProperty(key)) {
          if (state.breakpoints[key]) {
            this.newHeight++;
          } else {
            break;
          }
        }
      }
    });
  }

  minHeigth() {
    for (let i = 1; i < 1000; i++) {
      this.minHeigthList.push(`(min-height: ${i}rem)`);
    }
    this.escucharHeigth();
  }

}
