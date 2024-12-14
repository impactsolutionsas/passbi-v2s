import { Component, ViewChild } from '@angular/core';
import { SessionService } from '../services/session/session.service';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild('tabs', {static: false}) tabs: IonTabs | undefined;
  selectedTab: any = 'home';
  constructor(
    private sessionService: SessionService) {}

    setCurrentTab() {
      this.selectedTab = this.tabs?.getSelected();
      console.log(this.selectedTab);
    }
}
