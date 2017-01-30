import React, { Component } from 'react';
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

const default_total_splits = 1;

function divmod(a, b) {
    var quotient = parseInt(a / b)
    var remainder = a % b

    // console.log('[' + a + ', ' + b + '] Quotient(' + quotient + '), Remainder(' + remainder + ')');
    return {
        q: quotient,
        r: remainder
    }
}

function minifiedDataToString(minified_data) {
    if (minified_data === undefined) {
        return {}
    }
    const pp = minified_data.pp || 0;
    const gp = minified_data.gp || 0;
    const ep = minified_data.ep || 0;
    const sp = minified_data.sp || 0;
    const cp = minified_data.cp || 0;

    var elements = [];
    if (pp > 0) {
        elements.push(pp + " pp")
    }
    if (gp > 0) {
        elements.push(gp + " gp")
    }
    if (ep > 0) {
        elements.push(ep + " ep")
    }
    if (sp > 0) {
        elements.push(sp + " sp")
    }
    if (cp > 0) {
        elements.push(cp + " cp")
    }

    return elements.join(', ')
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
                    <h2>D&amp;D 5e Currency Minifier</h2>
                </div>

                <p className="App-intro">
                    A simple app that up-converts your coins to save weight.
                </p>

                <div className="container">
                    <CurrencyTable coins={currency_information}/>
                </div>
            </div>
        );
    }
}

class CurrencyTable extends Component {
    constructor(props) {
        super(props);
        // this.computeDenominations = this.computeDenominations.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTotalSplitsChange = this.handleTotalSplitsChange.bind(this);

        this.state = {
            minified_data: 'n/a',
            total_gold: 0,
            total_splits: default_total_splits
        }
    }

    componentDidMount() {
        // console.log("(CurrencyTable->componentDidMount)")
    }

    componentWillUnmount() {
        // console.log("(CurrencyTable->componentWillUnmount)")
    }

    computeDenominations(changed_coin_abbr, new_quantity, new_total_splits) {
        var total_gp = 0;
        var quantity = 0;

        var totals = {};

        this.props.coins.forEach((coin) => {
            quantity = coin.abbreviation === changed_coin_abbr ? new_quantity : this.getQuantityFromState(coin.abbreviation);

            total_gp += (quantity * coin.gp_exchange_rate)
            console.log("[" + coin.name + "] has " + this.getQuantityFromState(coin.abbreviation) + " at rate " + coin.gp_exchange_rate);
        });
        const total_gp_const = total_gp;
        this.setState({total_gold: total_gp_const});

        var tmp;
        this.props.coins.forEach((coin) => {
            tmp = divmod(total_gp, coin.gp_exchange_rate);

            totals[coin.abbreviation] = tmp.q
            total_gp = tmp.r
        });
        // Break this down into how many of each we can store...
        // Remove platinum


        // console.log(">>> Total... ");
        // console.log(totals);

        const total_splits = new_total_splits !== undefined ? new_total_splits : this.state.total_splits;
        const split_data = this.compute_split(total_gp_const, total_splits);
        this.setState({
            minified_data: totals,
            split_data: split_data
        });

        const total_string = minifiedDataToString(totals);
        const split_string = minifiedDataToString(split_data);

        console.log('Total: ' + total_string);
        console.log('Split: ' + split_string + '; across ' + total_splits + ' people.');
        console.log('=============== End CurrencyTable->ComputeDenominations ===================');
    }

    compute_split(total, splits) {
        // Total is in Gold
        var per_person = total / splits;

        var totals = {};
        var tmp;
        this.props.coins.forEach((coin) => {
            tmp = divmod(per_person, coin.gp_exchange_rate);

            totals[coin.abbreviation] = tmp.q
            per_person = tmp.r
        });

        return totals
    }

    _quantity_state_key(coin_abbr) {
        return 'quantity_' + coin_abbr
    }

    getQuantityFromState(coin_abbr) {
        // Mainly for ease of logging
        const key = this._quantity_state_key(coin_abbr);
        const value = this.state[key];

        return value || 0
    }

    handleChange(changed_coin_abbr, new_quantity) {
        // console.log('(CurrencyTable->handleChange) abbr=' + changed_coin_abbr + ', qty=' + new_quantity);

        const quantity_key =this._quantity_state_key(changed_coin_abbr);
        // console.log("Setting " + quantity_key + " to " + new_quantity);
        this.setState({ [quantity_key]: new_quantity });
        // console.log(this.state);

        // Pass in the hot data, because the state won't finish updating before calling this.
        this.computeDenominations(changed_coin_abbr, new_quantity)
        // console.log('(CurrencyTable->handleChange) END')
    }

    handleTotalSplitsChange(value) {
        this.setState({total_splits: value})
        this.computeDenominations(null, null, value)
    }

    render() {
        const minified_data = this.state.minified_data;
        var rows = [];

        const minified_str = minifiedDataToString(minified_data)
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

                <b>Minified: {minified_str}</b>
                <br/>
                <CurrencySplitter
                    total_data={this.state.total_data}
                    split_data={this.state.split_data}
                    total_gold={this.state.minified_data}
                    onChange={this.handleTotalSplitsChange}
                    />
                {/* <div> */}
                {/*     <code>{JSON.stringify(this.state)}</code> */}
                {/* </div> */}
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

class CurrencySplitter extends Component {
    constructor(props) {
        super(props);
        this.handleCountChange = this.handleCountChange.bind(this);
        this.toggleShowSplit = this.toggleShowSplit.bind(this);

        this.state = {
            show: false,
            count: default_total_splits
        }
    }

    toggleShowSplit(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        console.log(e)
        this.setState((prevState) => ({
            show: value
        }));
    }

    handleCountChange(e) {
        const target = e.target;
        const value = target.value;

        console.log("(CurrencySplitter->handleChange) " + value);

        this.setState({count: value});
        this.props.onChange(value);
    }

    render() {
        const should_show = this.state.show;
        const split_count = this.state.count;
        const split_amount = minifiedDataToString(this.props.split_data);
        const total_gold = minifiedDataToString(this.props.total_gold);

        console.log("(CurrencySplitter) show=" + should_show + ", count=" + split_count);

        return (
            <div id="split_container">
                <input type="checkbox" name="show_split" onChange={this.toggleShowSplit}  checked={should_show} />
                <div id="split_info">
                    <input type="text" name="split_count" size="4" onChange={this.handleCountChange} />
                </div>
                <div>
                    Splitting <b>{total_gold}</b> amongst <b>{split_count}</b> person(s) yields <b>{split_amount}</b> per person.
                </div>
            </div>
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

CurrencySplitter.defaultProps = {
    total_gold: {
        pp: 0,
        gp: 0,
        ep: 0,
        sp: 0,
        cp: 0
    },
    split_data: {
        pp: 0,
        gp: 0,
        ep: 0,
        sp: 0,
        cp: 0
    }
}

CurrencySplitter.propTypes = {

}

export default App;
