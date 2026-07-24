import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { BootSequenceComponent } from './components/boot-sequence/boot-sequence.component';
import { System7DesktopComponent } from './components/system7-desktop/system7-desktop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BootSequenceComponent, System7DesktopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'PowerPC 1996 Bit-Hacks Credit Card Utility';
  isBooting = signal<boolean>(true);

  onBootFinished(): void {
    this.isBooting.set(false);
  }

  reboot(): void {
    this.isBooting.set(true);
  }
}
