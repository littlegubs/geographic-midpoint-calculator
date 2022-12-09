import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MapGeocoder } from '@angular/google-maps'
import { HttpClient } from '@angular/common/http'

export interface RowAddress {
  label: string | null
  address?: GoogleMapsAddress
}

export interface GoogleMapsAddress {
  formatted_address?: string
  geometry?: {
    location?: google.maps.LatLngLiteral
  }
}

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
})
export class RowComponent implements OnInit, AfterViewInit {
  labelControl = new FormControl<string>('')
  addressControl = new FormControl<string>('')
  addresses?: google.maps.places.PlaceResult[] | null
  loading = false
  xd?: google.maps.places.PlacesService
  @Output() selectAddress = new EventEmitter<RowAddress>()
  @Output() removed = new EventEmitter<void>()
  @ViewChild('yoyo') yoyo?: ElementRef
  searchBox?: google.maps.places.SearchBox
  _address?: RowAddress | null

  @Input() index!: number
  @Input() set address(value: RowAddress | null) {
    this._address = value
    if (value?.label) {
      this.labelControl.setValue(value.label, {
        emitEvent: false,
      })
    }
  }
  @Output() addressChange = new EventEmitter<RowAddress>()

  @Input() set marker(marker: google.maps.LatLngLiteral | null) {
    this.geocode.geocode({ location: marker }).subscribe((result) => {
      if (this._address) {
        const address = result.results[0]
        this._address.address = {
          ...address,
          geometry: { location: address.geometry.location.toJSON() },
        }
      }
    })
  }

  constructor(private geocode: MapGeocoder, private httpClient: HttpClient) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.searchBox = new google.maps.places.SearchBox(this.yoyo?.nativeElement)
    this.searchBox.addListener('places_changed', () => {
      const address = this.searchBox?.getPlaces()?.[0]
      if (!address) return
      this._address = {
        address: { ...address, geometry: { ...address.geometry, location: address.geometry?.location?.toJSON() } },
        label: this.labelControl.value,
      }
      this.selectAddress.emit(this._address)
    })
    this.labelControl.valueChanges.subscribe((value) => {
      this.addressChange.emit({ ...this._address, label: value })
    })
  }

  remove(): void {
    this.removed.emit()
  }
}
