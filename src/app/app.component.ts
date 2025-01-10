import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaintComponent } from "./components/paint/paint.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PaintComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-paint';
}
