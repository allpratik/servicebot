import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import Dropdown from "../elements/datatable/datatable-dropdown.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalInviteUser from "../elements/modals/modal-invite-user.jsx";
import ModalSuspendUser from "../elements/modals/modal-suspend-user.jsx";
import ModalDeleteUser from "../elements/modals/modal-delete-user.jsx";

class ManageUsers extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            openInviteUserModal: false,
            openSuspendUserModal: false,
            openDeleteUserModal: false,
            currentDataObject: {},
            lastFetch: Date.now()
        };

        this.openInviteUserModal = this.openInviteUserModal.bind(this);
        this.closeInviteUserModal = this.closeInviteUserModal.bind(this);
        this.openSuspendUser = this.openSuspendUser.bind(this);
        this.closeSuspendUser = this.closeSuspendUser.bind(this);
        this.openDeleteUser = this.openDeleteUser.bind(this);
        this.closeDeleteUser = this.closeDeleteUser.bind(this);
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }
    modID(data){
        return (
            <div className="badge badge-xs">
                <img className="img-circle" src={`/api/v1/users/${data}/avatar`} alt="..."/>
            </div>
        );
    }
    modName(data, dataObj){
        return (
            <Link to={`/manage-users/${dataObj.id}`}>{data}</Link>
        );
    }
    modLastLogin(data, dataObj){
        if(dataObj.last_login != null){
            return (
                <DateFormat time={true} date={dataObj.last_login}/>
            );
        }else{
            return 'Never';
        }
    }
    modCreated(data){
        return (
            <DateFormat date={data}/>
        );
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

    }

    openInviteUserModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({ openInviteUserModal: true, currentDataObject: dataObject });
        }
    }
    closeInviteUserModal(){
        this.setState({ openInviteUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    viewUser(dataObject){
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            browserHistory.push(`/manage-users/${dataObject.id}`);
        }
    }
    viewUserServices(dataObject){
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            browserHistory.push(`/manage-subscriptions/?uid=${dataObject.id}`);
        }
    }

    openSuspendUser(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openSuspendUserModal: true, currentDataObject: dataObject});
        }
    }
    closeSuspendUser(){
        this.setState({openSuspendUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openDeleteUser(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openDeleteUserModal: true, currentDataObject: dataObject});
        }
    }
    closeDeleteUser(){
        this.setState({openDeleteUserModal: false,  currentDataObject: {}, lastFetch: Date.now()});
    }


    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];

        let getModals = ()=> {
            if(this.state.openInviteUserModal){
                return (
                    <ModalInviteUser show={this.state.openInviteUserModal} hide={this.closeInviteUserModal}/>
                )
            }
            if(this.state.openSuspendUserModal){
                return (
                    <ModalSuspendUser uid={this.state.currentDataObject.id} show={this.state.openSuspendUserModal} hide={this.closeSuspendUser}/>
                )
            }
            if(this.state.openDeleteUserModal){
                return (
                    <ModalDeleteUser uid={this.state.currentDataObject.id} show={this.state.openDeleteUserModal} hide={this.closeDeleteUser}/>
                )
            }
        };

        return(
            <Authorizer permissions="can_administrate">
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row m-b-20">
                            <div className="col-xs-12">
                                <ContentTitle icon="cog" title="Manage all your users here"/>
                                <Dropdown name="Actions"
                                          dropdown={[
                                              {id: 'invitenewuser', name: 'Invite New User', link: '#', onClick: this.openInviteUserModal}
                                              ]}/>
                                <DataTable get="/api/v1/users"
                                           col={['id', 'name', 'email', 'phone', 'references.user_roles.0.role_name', 'status', 'last_login', 'created_at']}
                                           colNames={['', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Last Login', 'Created']}
                                           mod_id={this.modID}
                                           mod_name={this.modName}
                                           mod_last_login={this.modLastLogin}
                                           mod_created_at={this.modCreated}
                                           lastFetch={this.state.lastFetch}
                                           dropdown={
                                               [{name:'Actions', direction: 'right',
                                                   buttons:[
                                                       {id: 1, name: 'Edit User', link: '#', onClick: this.viewUser},
                                                       {id: 2, name: 'Manage Services', link: '#', onClick: this.viewUserServices},
                                                       {id: 3, name: 'divider'},
                                                       {id: 4, name: 'Suspend User', link: '#', onClick: this.openSuspendUser},
                                                       {id: 5, name: 'Delete User', link: '#', onClick: this.openDeleteUser}
                                                       ]}
                                               ]
                                           }
                                />
                            </div>
                        </div>
                        {getModals()}
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ManageUsers;
