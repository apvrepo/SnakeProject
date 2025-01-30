/**********************************************************************************
* Name             LWCArcadeChild
* Author          Andres Pereyra
* Date            26/08/24
* Description     This is a Child LWC responsable for rendering the User Ranking board. It also uses conditional 
                   load templates and dinamically renders/updates the template depending on the commands of the 
                  PArent LWC component.
                   *** Credits: 
                   Original Game: Snake II™ - ©1998 NOKIA CORPORATION - Developer: Taneli Armanto.
                   Game Sounds Source: PAC-MAN™ & ©1980 BANDAI NAMCO Entertainment Inc.
                   Cellphone Image: NOKIA 1100 - NOKIA CORPORATION.
***********************************************************************************
* MODIFICATION LOG
* Version            Developer          Date               Description
* ------------------------------------------------------------------------------
* 1.0                Andres Pereyra     26 August 2024           Initial Creation 
* *********************************************************************************/

import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from "@salesforce/apex";
import loadUsers from "@salesforce/apex/UserWireClass.getUsersImperatively";

export default class LWCArcadeChild extends LightningElement {
    @track wiredUsers = [];
    @track load = false;
    @track hasHandledLoad = false;

    @api setMessage(msg) {
        this.load = msg;
    };
  // WIRE SERVICES
    async handleLoad() {
       console.log('CHILD - LWCArcadeChild.handleLoad() ');
        try {
            this.wiredUsers = await loadUsers();
            this.error = undefined;
        } catch (error) {
            this.error = error;
            this.wiredUsers = undefined;
            console.log('Error - handleLoad(): ' + error);
        }
    }

    // LIFECYCLE HOOKS:
    connectedCallback() {
    }

    renderedCallback() {
        if (this.load && !this.hasHandledLoad) {
            this.handleLoad();
            this.hasHandledLoad = true; // Mark that handleLoad has been executed 
        } else if (!this.load && this.hasHandledLoad) {
            refreshApex(this.wiredUsers);
            this.hasHandledLoad = false; // Reset the flag when load is false
        }
    }

}