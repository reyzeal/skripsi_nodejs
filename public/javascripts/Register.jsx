const {BrowserRouter, Switch, Route, Link} = ReactRouterDOM;
const {Button, Form, FormGroup, Label, Input, Nav, NavItem, NavLink } = Reactstrap;

class RegisterLayout extends React.Component{
    constructor(props){
        super(props);
        let path = window.location.pathname.split('/').pop();
        this.state = {
            path : path
        };
    }
    update(){
        let that = this;
        setTimeout(function () {
            let path = window.location.pathname.split('/').pop();
            that.setState({
                path : path
            });
        },100);
    }
    render(){
        let path = this.state.path;
        return <BrowserRouter>
            <div className="container-fluid d-flex justify-content-center align-content-center min-vh-100 bg-dark">
                <Form className="bg-light p-5" style={{width:'600px'}}>
                    <Nav pills>
                        <NavItem className={"d-flex mx-auto my-3"}>
                            <Link className={path === 'mahasiswa'?"nav-link bg-primary text-white":"nav-link"} to={'/users/register/mahasiswa'} onClick={this.update.bind(this)}>Mahasiswa</Link>
                            <Link className={path === 'dosen'?"nav-link bg-primary text-white":"nav-link"} to={'/users/register/dosen'} onClick={this.update.bind(this)}>Dosen</Link>
                            <Link className={path === 'tatausaha'?"nav-link bg-primary text-white":"nav-link"} to={'/users/register/tatausaha'} onClick={this.update.bind(this)}>Tatausaha</Link>
                        </NavItem>
                    </Nav>
                    <Switch>
                        <Route exact path='/users/register/mahasiswa'>
                            <p className="display-4">Registrasi Mahasiswa</p>
                            <FormGroup>
                                <Label for="nim">NIM</Label>
                                <Input type="number" name="nim" placeholder={"Nomor Induk Mahasiswa"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="pin">PIN</Label>
                                <Input type="text" name="pin" placeholder={"PIN CBIS"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input type="email" name="email" placeholder={"Email Address"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Password</Label>
                                <Input type="password" name="password" placeholder={"Password"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password_confirmation">Confirm Password</Label>
                                <Input type="password" name="password_confirmation" placeholder={"Confirm Password"}/>
                            </FormGroup>
                        </Route>
                        <Route path='/users/register/dosen'>
                            <p className="display-4">Registrasi Dosen</p>
                            <FormGroup>
                                <Label for="nim">NIK/NIP</Label>
                                <Input type="number" name="nim" placeholder={"NIK/NIP"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="nama">Nama</Label>
                                <Input type="text" name="nama" placeholder={"Nama dengan Gelar"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input type="email" name="email" placeholder={"Email Address"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Password</Label>
                                <Input type="password" name="password" placeholder={"Password"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password_confirmation">Confirm Password</Label>
                                <Input type="password" name="password_confirmation" placeholder={"Confirm Password"}/>
                            </FormGroup>
                        </Route>
                        <Route path='/users/register/tatausaha'>
                            <p className="display-4">Registrasi Tatausaha</p>
                            <FormGroup>
                                <Label for="nim">Nomor Pegawai</Label>
                                <Input type="number" name="nim" placeholder={"Nomor Pegawai"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="nama">Nama</Label>
                                <Input type="text" name="nama" placeholder={"Nama dengan Gelar"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input type="email" name="email" placeholder={"Email Address"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Password</Label>
                                <Input type="password" name="password" placeholder={"Password"}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password_confirmation">Confirm Password</Label>
                                <Input type="password" name="password_confirmation" placeholder={"Confirm Password"}/>
                            </FormGroup>
                        </Route>
                    </Switch>
                    <Button className={"btn btn-success"}>Submit</Button>
                    <Button type={"reset"} className={"btn btn-danger"}>Reset</Button>
                </Form>
            </div>
        </BrowserRouter>
    }
}
ReactDOM.render(<RegisterLayout/>, document.getElementById('main'));