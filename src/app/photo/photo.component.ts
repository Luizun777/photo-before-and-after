import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import html2canvas from 'html2canvas';
import { ActivatedRoute, Router } from '@angular/router';

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

  cameraIndex: number = 0;
  captures: string[] = [];
  listCarama: any[] = [];
  cameraId: string = '';
  error: any;
  isCaptured: boolean = false;
  isCam: boolean = false;
  imagen: any;
  imagenUpload: any;
  imagenW: any;
  imagenH: any;
  opacity: number = 65;
  badgeHidden: boolean = true;
  capturesLength: number = 0;

  constructor(
    public breakpointObserver: BreakpointObserver,
    private router: ActivatedRoute,
    private route: Router
  ) { }

  ngOnInit(): void {
    this.routerInit();
  }

  routerInit() : void {
    this.router.params.subscribe((param: any) => {
      this.cameraIndex = Number(param['cam']);
    });
  }

  ngOnDestroy(): void {
    this.minWidthSub.unsubscribe();
    this.minHeigthSub.unsubscribe();
  }

  updateOpacity(event: any) {
    this.opacity = event.value;
  }

  updateW(event: any): void {
    this.imagenW = event.value
  }

  updateH(event: any): void {
    this.imagenH = event.value
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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const selectedCamera = this.listCarama.find((c) => c.label.includes('back')) || this.listCarama[0];
        const videoConstraints = {
          video: true,
          deviceId: { exact: selectedCamera.deviceId}
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
    this.imagen = this.canvas.nativeElement.toDataURL("image/png");
    if (this.captures.length > 0) {
      this.badgeHidden = false;
      this.capturesLength = this.captures.length;
    }

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

  changeCamera() {
    const actualy = this.listCarama.find((camera: any) => camera.check);
    const index = this.listCarama.indexOf(actualy);
    this.listCarama.forEach((camara: any, i: number) => {
      camara.check = i !== index;
    });
    this.route.navigate(['/camera', this.cameraIndex === 0 ? 1 : 0]);
    // window.location.reload();
    const select = this.listCarama.find((camera: any) => camera.check);
    const videoConstraints = {
      video: true,
      deviceId: { exact: select.deviceId}
    };
    this.video.nativeElement.removeCurrent();
    navigator.mediaDevices.getUserMedia({video: videoConstraints}).then((stream) => {
      console.log(stream);
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.play();
    });
  }

  onFileInput(event: any) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      const img: any = new Image();
      img.onload = () => {
        console.log(img.width);
        console.log(img.height);
        this.imagenW = img.width;
        this.imagenH = img.height;
      };
      this.imagenUpload = event.target.result;
      img.src = reader.result
    };

    reader.onerror = (event: any) => {
      console.log("File could not be read: " + event.target.error.code);
    };

    if (event.target.files[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
    this.isCaptured = true;
  }

  formatLabelWidth(): any {
    return 'W';
  }

  formatLabelHeidth(): any {
    return 'H';
  }

  descargarImage(): void {
    for (const image of this.captures) {
      const a = document.createElement("a"); //Create <a>
      a.href = image;
      a.download = "Image.png"; //File name Here
      a.click(); //Downloaded file
    }
    this.reset();
  }

  reset(): void {
    this.imagen = null;
    this.captures = [];
    this.capturesLength = this.captures.length;
    this.badgeHidden = true;
    this.isCaptured = false;
  }

}
