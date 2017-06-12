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


import Reflux from 'reflux';
import WizardActions from '../../actions/WizardActions';
import ConnectionsActions from '../../actions/ConnectionsActions';
import {servicesUrl, itemsPerPage, networkMock, targetNetworkMock} from '../../config';
import Api from '../../components/ApiCaller';

class UsersStore extends Reflux.Store
{
  blankState = {
    sourceCloud: null,
    targetCloud: null,
    breadcrumbs: [],
    currentStep: "WizardMigrationType",
    nextStep: null,
    nextCallback: null,
    backCallback: null,
    valid: false,
    migrationName: null,
    autoFlavors: true,
    diskFormat: "VHD",
    migrationType: "migration",
    fipPool: null,
    schedules: [],
    instances: null,
    selectedInstances: [],
    vms: null,
    destination_environment: {},
    networks: networkMock, // TODO: Change mock here
    targetNetworks: targetNetworkMock, // TODO: Change mock here
    selected: false,
    wizardStarted: false
  }

  constructor() {
    super()
    this.listenables = [WizardActions, ConnectionsActions]

    this.state = Object.assign({}, this.blankState)
  }

  onLoadInstances(endpoint, page = 0, queryText = "", cache = true, clearSelection = false) {
    if (cache && (this.state.instances && this.state.instances[page * itemsPerPage])) {
      return;
    }
    if (!cache) {
      this.setState({ instances: null })
    }
    let projectId = Reflux.GlobalState.userStore.currentUser.project.id

    if (clearSelection) {
      this.setState({ selectedInstances: [] })
    }

    let markerId = null
    if (page > 0 && this.state.instances[(page - 1) * itemsPerPage + itemsPerPage - 1]) {
      markerId = this.state.instances[(page - 1) * itemsPerPage + itemsPerPage - 1].id
    }

    let url = `${servicesUrl.coriolis}/${projectId}/endpoints/${endpoint.id}/instances?limit=${itemsPerPage}`
    if (markerId != null) {
      url = `${url}&marker=${markerId}`
    }
    if (queryText != "") {
      url = `${url}&name=${queryText}`
    }

    Api.sendAjaxRequest({
      url: url,
      method: "GET"
    }).then(response => {
        ConnectionsActions.loadInstances.completed(response, page)
      }, ConnectionsActions.loadInstances.failed)
      .catch(ConnectionsActions.loadInstances.failed);
  }

  onLoadInstancesCompleted(response, page) {
    let instances = this.state.instances

    if (instances == null) {
      instances = []
    }
    response.data.instances.forEach((instance, index) => {
      instances[(page * itemsPerPage) + index] = instance
    })

    this.setState({ instances: instances })
  }

  onNewState() {
    this.setState(this.blankState)
  }

  onUpdateWizardState(state, callback = null) {
    this.setState(state)
    if (callback) callback()
  }

}

export default UsersStore;
