import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// Matrix of information to use
const currency_information = [
    {
        "name": 'Platinum',
        "abbreviation": 'pp',
        "gp_exchange_rate": 10
    },
    {
        "name": 'Gold',
        "abbreviation": 'gp',
        "gp_exchange_rate": 1
    },
    {
        "name": 'Elementium',
        "abbreviation": 'ep',
        "gp_exchange_rate": 1/2
    },
    {
        "name": 'Silver',
        "abbreviation": 'sp',
        "gp_exchange_rate": 1/10
    },
    {
        "name": 'Copper',
        "abbreviation": 'cp',
        "gp_exchange_rate": 1/100
    }
]

function divmod(a, b) {
    var quotient = parseInt(a / b)
    var remainder = a % b

    console.log('[' + a + ', ' + b + '] Quotient(' + quotient + '), Remainder(' + remainder + ')');
    return {
        q: quotient,
        r: remainder
    }
}

class App extends Component {
    componentDidMount() {
        // console.log("(App->componentDidMount)")
    }

    componentWillUnmount() {
        // console.log("(App->componentWillUnmount)")
    }

    render() {
        return (
            <div className="App">
            <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
            </div>
            <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
            </p>

            <CurrencyTable coins={currency_information}/>
            </div>
        );
    }
}

class CurrencyTable extends Component {
    constructor(props) {
        super(props);
        // this.computeDenominations = this.computeDenominations.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            minified_coins: 'n/a'
        }
    }

    componentDidMount() {
        // console.log("(CurrencyTable->componentDidMount)")
    }

    componentWillUnmount() {
        // console.log("(CurrencyTable->componentWillUnmount)")
    }

    computeDenominations(changed_coin_abbr, new_quantity) {
        var total_gp = 0;
        var quantity = 0;

        var totals = {};

        this.props.coins.forEach((coin) => {
            quantity = coin.abbreviation === changed_coin_abbr ? new_quantity : this.getQuantityFromState(coin.abbreviation);

            total_gp += (quantity * coin.gp_exchange_rate)
            console.log("[" + coin.name + "] has " + this.getQuantityFromState(coin.abbreviation) + " at rate " + coin.gp_exchange_rate);
        });
        console.log("Total GPs: " + total_gp);

        var tmp;
        this.props.coins.forEach((coin) => {
            tmp = divmod(total_gp, coin.gp_exchange_rate);

            totals[coin.abbreviation] = tmp.q
            total_gp = tmp.r
        });
        // Break this down into how many of each we can store...
        // Remove platinum


        console.log(">>> Total... ");
        console.log(totals);
        this.setState({minified_coins: totals});
        console.log('=============== End CurrencyTable->ComputeDenominations ===================');
    }

    _quantity_state_key(coin_abbr) {
        return 'quantity_' + coin_abbr
    }

    getQuantityFromState(coin_abbr) {
        const key = this._quantity_state_key(coin_abbr);
        // console.log('getQuantityFromState(' + coin_abbr + ')');
        const value = this.state[key];
        // console.log(this.state);
        // console.log('getQuantityFromState ==> ' + value);
        return value || 0
    }

    handleChange(changed_coin_abbr, new_quantity) {
        console.log('(CurrencyTable->handleChange) abbr=' + changed_coin_abbr + ', qty=' + new_quantity);

        const quantity_key =this._quantity_state_key(changed_coin_abbr);
        console.log("Setting " + quantity_key + " to " + new_quantity);
        this.setState({ [quantity_key]: new_quantity });
        console.log(this.state);

        // Pass in the hot data, because the state won't finish updating before calling this.
        this.computeDenominations(changed_coin_abbr, new_quantity)
        console.log('(CurrencyTable->handleChange) END')
    }

    render() {
        const minified_coins = this.state.minified_coins;
        var rows = [];

        // console.log('======== CurrencyTable->Render :: Foreach Coins ============');
        this.props.coins.forEach((coin) => {
            // console.log(coin);
            rows.push(
                <Currency
                    key={coin.abbreviation}
                    name={coin.name}
                    abbreviation={coin.abbreviation}
                    gp_exchange_rate={coin.gp_exchange_rate}
                    onChange={this.handleChange}
                />
            );
        });
        // console.log('======== CurrencyTable->Render :: Foreach Coins END ============');

        return (
            <div id="currencytable">
                <table>
                    <thead>
                        <tr>
                            <th>Qty</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>

                <b>Minified: {minified_coins.pp} pp, {minified_coins.gp} gp, {minified_coins.ep} ep, {minified_coins.sp} sp, {minified_coins.cp} cp</b>
                <div>
                    <code>{JSON.stringify(this.state)}</code>
                </div>
            </div>
        )
    }
}


class Currency extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {quantity: 0}
    }

    componentDidMount() {
        // console.log("(Currency->componentDidMount)")
    }

    componentWillUnmount() {
        // console.log("(Currency->componentWillUnmount)")
    }

    handleChange(value) {
        // console.log("(Currency->HandleChange :: " + this.props.name + ") value=" + value);
        this.setState({quantity: value});

        // console.log("(Currency->handleChange :: " + this.props.name + ") state is...");
        // console.log(this.state);

        // Send this upstream
        // console.log("(Currency->handleChange :: " + this.props.name + ") props is...");
        // console.log(this.props);
        this.props.onChange(this.props.abbreviation, value);

        // compute_denominations(this.props.abbreviation, value)
    }

    render() {
        const quantity = this.state.quantity;

        // console.log('[' + this.props.name + '] (Currency->Render) qty=' + quantity);
        return (
            <tr>
                <td>
                    <CurrencyInput
                        key={this.props.abbreviation}
                        quantity={quantity}
                        onChange={this.handleChange}
                    /> {this.props.abbreviation}
                </td>
                <td>
                    ({this.props.name})
                </td>
            </tr>
        )
    }
}

class CurrencyInput extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        // console.log("(CurrencyInput->componentDidMount)")
    }

    componentWillUnmount() {
        // console.log("(CurrencyInput->componentWillUnmount)")
    }

    handleChange(e) {
        // console.log("===================  >>> INPUT CHANGED <<< =======================");
        // console.log("(CurrencyInput->HandleChange) value=" + e.target.value);
        this.props.onChange(e.target.value);
    }

    render() {
        const quantity = this.props.quantity;
        return (
            <input type="text" size="4" name={this.props.abbreviation} value={quantity} onChange={this.handleChange} />
        )
    }
}

Currency.defaultProps = {
    name: 'Unknown',
    abbreviation: '??',
    color: 'black',
    exchange_rate_gp: 0,
    quantity: 0
}

Currency.propTypes = {
    name: React.PropTypes.string,
    abbreviation: React.PropTypes.string,
    color: React.PropTypes.string,
    exchange_rate_gp: React.PropTypes.number
}

export default App;
