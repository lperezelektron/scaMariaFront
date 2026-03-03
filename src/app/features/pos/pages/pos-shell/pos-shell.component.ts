import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pos-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './pos-shell.component.html',
  styleUrl: './pos-shell.component.scss'
})
export class PosShellComponent {

}
