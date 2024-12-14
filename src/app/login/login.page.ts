import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { AuthService } from '../services/auth/auth.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  networkStatus: any;
  isOnline = false;
  loginError = false;

  constructor(private fb: FormBuilder, private storage: Storage,
    private authService: AuthService,  private router: Router) {
      this.storage.create();
      this.checkLogin();
    }

    ngOnInit() {
      this.checkLogin();
      if (Network) {
        Network.getStatus().then((status)=> {
          this.networkStatus = status
          if (this.networkStatus.connected == true) {
            this.isOnline = true
            console.log("🚀 ~ LoginPage ~ Network.getStatus ~ this.isOnline:", this.isOnline)
          }
          console.log("🚀 ~ Network.getStatus ~ networkStatus:", this.networkStatus)
        })
      }

      Network.addListener('networkStatusChange', async (status) => {
        this.isOnline = status.connected
        console.log("🚀 ~ LoginPage ~ ~ this.isOnline: changed ", this.isOnline)
        console.log('Network status changed', status);
        this.networkStatus = status;

      });

      this.loginForm = this.fb.group({
        code: ['', [Validators.required]],
      });

    }

    async checkLogin() {
    await  this.storage.get('isAuthenticated').then(isAuthenticated => {
        console.log("isAuthenticated:", isAuthenticated);
        if (isAuthenticated) {
          this.router.navigate(['/tabs']);
        }
      });
    }
    async onSubmit() {
      if (this.loginForm.valid) {
        const { code } = this.loginForm.value;
        await this.authService.login(code,);
      }
    }
}
