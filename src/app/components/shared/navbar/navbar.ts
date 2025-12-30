import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FlowbiteS } from '../../../services/flowbite';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  flowbiteService = inject(FlowbiteS);

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      flowbite.initFlowbite();
      console.log(flowbite);
    });
  }

}
