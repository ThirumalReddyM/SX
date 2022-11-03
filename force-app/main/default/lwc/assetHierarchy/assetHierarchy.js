import { LightningElement, wire, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

// Import Apex
import findAssetHierarchyData from "@salesforce/apex/AssetHierarchyController.findAssetHierarchyData";
import getAllParentAssets from "@salesforce/apex/AssetHierarchyController.getAllParentAssets";
import lookUp from '@salesforce/apex/AssetHierarchyController.search';

import { getFieldValue, getRecord } from 'lightning/uiRecordApi';

// Global Constants
const COLS = [
        {
            type: 'url',
            fieldName: 'AssetURL',
            initalWidth: 250,
            label: 'Asset Name',
            title: 'assetName',
            typeAttributes: {
                label: { fieldName: 'assetName' },
                title: { fieldName: 'assetName' },
                target: '_blank'
            }
        },
        {
            type: 'text',
            fieldName: 'productName',
            initalWidth: 250,
            label: 'Product'
        },
        {
            type: 'text',
            fieldName: 'parentAssetName',
            initalWidth: 250,
            label: 'Parent Asset'
        },
        {
            type: 'text',
            fieldName: 'locationName',
            initalWidth: 250,
            label: 'Location'
        },
        {
            type: 'button-icon',
            initalWidth: 50,
            typeAttributes: {
                iconName: 'utility:edit',
                name: 'edit_record', 
                title: 'Edit',
                variant: 'border-filled',
                alternativeText: 'edit',
                disabled: false
            }
        }
        
    ];

export default class AssetHierarchyLWC extends LightningElement {
    @api recordId;
    gridColumns = COLS;
    gridData = [];
    gridExpandedRows = [];
    isLoading = true;
    isChildEditable = false;
    parentAssetId = '';
    selecteChildRecId = '';
    selectedChildAssetName = '';
    assetWithSameLocation = '';

    //Custom Lookup
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    @api iconName;
    @api searchPlaceholder = 'Search Asset';
    @track selectedName;
    @track records;
    @track isValueSelected;
    @track blurTimeout;
    searchTerm;

    connectedCallback() {
        console.log('connect starts:::',this.recordId);
        findAssetHierarchyData({ 
            recId : this.recordId 
            })
            .then((data) => {
                console.log('my nara assetRecords:::' ,data);
                console.log('Nara Data ' + JSON.stringify(data));
                let roles = {};
                roles[undefined] = { Name: "Root", _children: [] };
                var expandedRows = [];
                var data1 = data;
                data1.map((record) => ({
                    _children: [],
                    ...record,
                    assetName: record.Name ,
                    name: record.Id, 
                    Id: record.Id, 
                    productName:record.Product2 ? record.Product2.Name : '',
                    parentAssetName:record.Parent ? record.Parent.Name : '',
                    locationName:record.Location ? record.Location.Name : '' ,
                    AssetURL:'/'+record.Id

                }));
                for(let key in data) {
                    expandedRows.push(data[key].Id);
                    roles[data[key].Id] = { 
                        assetName: data[key].Name ,
                        name: data[key].Id, 
                        Id: data[key].Id, 
                        productName:data[key].Product2 ? data[key].Product2.Name : '',
                        parentAssetName:data[key].Parent ? data[key].Parent.Name : '',
                        locationName:data[key].Location ? data[key].Location.Name : '' ,
                        AssetURL:'/'+data[key].Id,
                         _children: []
                    };
                }
                for(let key in data) {
                    roles[data[key].ParentId]._children.push(roles[data[key].Id]);   
                }
                this.gridData = roles[undefined]._children;
                this.gridExpandedRows = expandedRows;
                console.log('gridData:::', this.gridData);
                this.isLoading = false;
            })
            .catch((error) => {
                console.log("Error loading child", error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error Loading Children",
                        message: error + " " + error?.message,
                        variant: "error"
                    })
                );
            })   
    }

    get assetData() {
        return (this.gridData.length > 0 ? true : false);
    }
    
    closeModal() {
        this.selecteChildRecId = '';
        this.selectedChildAssetName == '';
        this.assetWithSameLocation = '';
        this.selectedChildParentAssetId = '';
        this.isChildEditable = false;
    }

    
    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() => { this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus' }, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        this.selectedChildParentAssetId = selectedId;
        this.isValueSelected = true;
        this.selectedName = selectedName;
        this.parentAssetId = selectedId;      
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

    handleToast(title, type, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: type,
                message: message
            })
        );
    }

    handleRowAction(event) {
        console.log('handleRowAction:::::::');
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log('actionName::', actionName);
        console.log('row::', JSON.stringify(row));
        this.selecteChildRecId = row.Id;
        getAllParentAssets({ 
            parentRecId : this.selecteChildRecId
            })
            .then((result) => {
                console.log('result getAllParentAssets:::' ,result);
                this.parentAssetId = result[0].ParentId;  
                this.isValueSelected = true;
                this.selectedName = result[0].Parent.Name;
                this.isChildEditable = true;     
                lookUp({ 
                recordId : this.selecteChildRecId
                })
                .then((result) => {
                    console.log('result lookUp:::' ,result);
                    if (result) {
                        this.records = result;
                        
                    } else if (error) {
                        this.records = undefined;
                        console.log(JSON.stringify(error));
                    }
                                
                })
                .catch((error) => {
                    console.log("Error loading child", error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Error Loading Children",
                            message: error + " " + error?.message,
                            variant: "error"
                        })
                    );
                })          
            })
            .catch((error) => {
                console.log("Error loading child", error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error Loading Children",
                        message: error + " " + error?.message,
                        variant: "error"
                    })
                );
            })
        
    }

    handleSubmit(event) {
        console.log('handleSubmit:::::::');
        event.preventDefault();  
        const fields = event.detail.fields;
        console.log('fields::::::Fields:::', JSON.stringify(fields));
        console.log('fields::::::', JSON.stringify(this.template.querySelector('lightning-record-edit-form')));
        this.template.querySelector('lightning-record-edit-form').submit(fields);

    }
    
    handleSuccess(event) {
        console.log('handleSuccess:::::::');
        this.isChildEditable = false;
        this.handleToast('','success','Asset has been updated successfully. Reloading..');        
        location.reload();

    }
    handleError(event) {
        console.log(JSON.stringify(event.detail));
        let errorMessage = '';
        if(event.detail && event.detail.output && event.detail.output.fieldErrors ) {
            for (let key in event.detail.output.fieldErrors) {
              	console.log(key, event.detail.output.fieldErrors[key]);
                for(var i=0;i<event.detail.output.fieldErrors[key].length;i++) {
                    errorMessage = errorMessage + event.detail.output.fieldErrors[key][i].fieldLabel + ': ';
                    errorMessage = errorMessage + event.detail.output.fieldErrors[key][i].errorCode + ' - ';
                    errorMessage = errorMessage + event.detail.output.fieldErrors[key][i].message;
                    errorMessage = errorMessage + '\n';
                }
            }
            if(event.detail && event.detail.output && event.detail.output.errors ) {
            	console.log('error fieldErrors::',JSON.stringify(event.detail.output.errors));
                for(var i=0;i<event.detail.output.errors.length;i++) {
                    errorMessage = errorMessage + 'OTHER_EXCEPTION - ';
                    errorMessage = errorMessage + event.detail.output.errors[i].message;
                    errorMessage = errorMessage + '\n';
                }
            }
        }
        console.log('errorMessage:::', errorMessage);
        
        this.handleToast('Error Loading Children','error',errorMessage);   
    }  
}