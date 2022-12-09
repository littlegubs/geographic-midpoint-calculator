import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core'
import { GoogleMap, MapGeocoder } from '@angular/google-maps'
import { RowAddress } from './components/row/row.component'
import { FormControl } from '@angular/forms'
import { BehaviorSubject, Observable } from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap) googleMap?: GoogleMap
  private addressesSubject = new BehaviorSubject<Array<RowAddress>>([{ label: null }, { label: null }])
  addressesAsync: Observable<Array<RowAddress>> = this.addressesSubject.asObservable()

  addresses = this.addressesSubject.getValue()
  markerPositions: google.maps.LatLngLiteral[] = []
  private centerPositionSubject = new BehaviorSubject<google.maps.LatLngLiteral | undefined>(undefined)
  centerPosition: Observable<google.maps.LatLngLiteral | undefined> = this.centerPositionSubject.asObservable()
  calculationMethod = new FormControl<'bound_center' | 'average'>('average', {
    nonNullable: true,
  })

  innerWidth = 0
  showMap = false

  constructor(private cdr: ChangeDetectorRef, private geocoder: MapGeocoder) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth
    if (this.innerWidth > 768) {
      this.showMap = true
    }
  }

  ngAfterViewInit(): void {
    const addressesJson = localStorage.getItem('addresses')
    if (addressesJson) {
      this.addresses = JSON.parse(addressesJson) as Array<RowAddress>
      this.addressesSubject.next(this.addresses)
      this.addressesSubject.getValue().forEach((address, index) => {
        if (address) {
          const lat = (address.address?.geometry?.location as unknown as google.maps.LatLngLiteral)?.lat
          const lng = (address.address?.geometry?.location as unknown as google.maps.LatLngLiteral)?.lng
          if (lat !== undefined && lng !== undefined) {
            this.placeMarker(
              {
                lat,
                lng,
              },
              index
            )
          }
        }
      })
    } else {
      localStorage.setItem('addresses', JSON.stringify(this.addressesSubject.getValue()))
    }
    this.calculationMethod.valueChanges.subscribe(() => {
      void this.updateMap()
    })
  }

  selectedAddress($event: RowAddress, index: number): void {
    const addresses = [...this.addresses]
    addresses[index] = $event
    this.addresses = addresses
    localStorage.setItem('addresses', JSON.stringify(addresses))
    if ($event.address?.geometry?.location) {
      this.placeMarker($event.address.geometry.location, index)
    }
  }

  addAddress(): void {
    this.addresses = [...this.addresses, { label: null }]
    this.addressesSubject.next(this.addresses)
    localStorage.setItem('addresses', JSON.stringify(this.addressesSubject.getValue()))
  }

  placeMarker(location: google.maps.LatLngLiteral, index: number): void {
    this.markerPositions[index] = { lat: location.lat, lng: location.lng }
    void this.updateMap()
  }

  async updateMap(timeout = false): Promise<void> {
    const bounds = new google.maps.LatLngBounds()
    let latAvg = 0
    let lngAvg = 0
    for (const position of this.markerPositions) {
      if (position) {
        bounds.extend(position)
        latAvg += position.lat
        lngAvg += position.lng
      }
    }
    latAvg = latAvg / this.markerPositions.filter((position) => position).length
    lngAvg = lngAvg / this.markerPositions.filter((position) => position).length
    if (timeout) {
      await delay(100)
    }
    this.googleMap?.googleMap?.setCenter(bounds.getCenter())
    this.googleMap?.googleMap?.fitBounds(bounds)
    this.centerPositionSubject.next(
      this.calculationMethod.value === 'average' ? { lat: latAvg, lng: lngAvg } : bounds.getCenter().toJSON()
    )
  }

  removeMarker(index: number): void {
    this.markerPositions = this.markerPositions.filter((_, i) => i !== index)
    this.addresses = this.addresses.filter((_, i) => i !== index)
    this.addressesSubject.next(this.addresses)
    localStorage.setItem('addresses', JSON.stringify(this.addressesSubject.getValue()))
    void this.updateMap()
  }

  moveMarker($event: google.maps.MapMouseEvent, i: number): void {
    if ($event.latLng) {
      this.markerPositions[i] = { lat: $event.latLng.lat(), lng: $event.latLng.lng() }
      this.geocoder.geocode({ location: this.markerPositions[i] }).subscribe((result) => {
        const addresses = this.addresses
        const address = addresses[i]
        if (address) {
          addresses[i] = {
            ...address,
            address: { ...result.results[0], geometry: { location: result.results[0].geometry.location.toJSON() } },
          }
          this.addresses = addresses
          this.addressesSubject.next(this.addresses)
          localStorage.setItem('addresses', JSON.stringify(this.addressesSubject.getValue()))
        }
      })
      void this.updateMap()
    }
  }

  xd($event: RowAddress, i: number) {
    const addresses = [...this.addresses]
    addresses[i] = $event
    this.addresses = addresses
    localStorage.setItem('addresses', JSON.stringify(addresses))
  }

  toggleMap(): void {
    this.showMap = !this.showMap
    void this.updateMap(true)
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
