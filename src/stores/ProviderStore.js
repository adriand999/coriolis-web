/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import { observable, action } from 'mobx'

import ProviderSource from '../sources/ProviderSource'
import { providersWithExtraOptions } from '../config.js'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import type { DestinationOption } from '../types/Endpoint'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'

class ProviderStore {
  @observable connectionInfoSchema: Field[] = []
  @observable connectionSchemaLoading: boolean = false
  @observable providers: ?Providers
  @observable providersLoading: boolean = false
  @observable optionsSchema: Field[] = []
  @observable optionsSchemaLoading: boolean = false
  @observable destinationOptions: DestinationOption[] = []
  @observable destinationOptionsLoading: boolean = false

  lastOptionsSchemaType: string = ''

  @action getConnectionInfoSchema(providerName: string): Promise<void> {
    this.connectionSchemaLoading = true

    return ProviderSource.getConnectionInfoSchema(providerName).then((fields: Field[]) => {
      this.connectionSchemaLoading = false
      this.connectionInfoSchema = fields
    }).catch(() => {
      this.connectionSchemaLoading = false
    })
  }

  @action clearConnectionInfoSchema() {
    this.connectionInfoSchema = []
  }

  @action loadProviders(): Promise<void> {
    this.providers = null
    this.providersLoading = true

    return ProviderSource.loadProviders().then((providers: Providers) => {
      this.providers = providers
      this.providersLoading = false
    }).catch(() => {
      this.providersLoading = false
    })
  }

  @action loadOptionsSchema(providerName: string, schemaType: string): Promise<void> {
    this.optionsSchemaLoading = true
    this.lastOptionsSchemaType = schemaType

    return ProviderSource.loadOptionsSchema(providerName, schemaType).then((fields: Field[]) => {
      this.optionsSchemaLoading = false
      this.optionsSchema = fields
    }).catch(() => {
      this.optionsSchemaLoading = false
    })
  }

  @action getDestinationOptions(endpointId: string, provider: string, envData?: { [string]: mixed }): Promise<DestinationOption[]> {
    let providerWithExtraOptions = providersWithExtraOptions.find(p => typeof p === 'string' ? p === provider : p.name === provider)
    if (!providerWithExtraOptions) {
      return Promise.resolve([])
    }

    this.destinationOptionsLoading = true
    this.destinationOptions = []
    let destOptions = []

    return ProviderSource.getDestinationOptions(endpointId, envData).then(options => {
      this.optionsSchema.forEach(field => {
        const parser = OptionsSchemaPlugin[provider] || OptionsSchemaPlugin.default
        parser.fillFieldValues(field, options)
      })
      this.destinationOptions = options
      destOptions = options
      this.destinationOptionsLoading = false
    }).catch(err => {
      console.error(err)
      if (envData) {
        return this.loadOptionsSchema(provider, this.lastOptionsSchemaType).then(() => {
          return this.getDestinationOptions(endpointId, provider)
        })
      }
      return this.loadOptionsSchema(provider, this.lastOptionsSchemaType)
    }).then(() => {
      this.destinationOptionsLoading = false
      return destOptions
    })
  }
}

export default new ProviderStore()
