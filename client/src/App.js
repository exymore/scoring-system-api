import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { buildCollapsibleTree, buildRadialTidyTree } from './Diagrams';
import promiseRetry from 'promise-retry';
import Loader from './Loader';
import Fab from '@material-ui/core/Fab';
import { i18n } from './i18n';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  },
  card: {
    margin: '20px 0',
    maxWidth: 345
  }
}));

function App() {
  const classes = useStyles();

  const [state, setState] = useState({
    married: null,
    dependents: null,
    education: null,
    selfEmployed: null,
    income: null,
    coapplicantIncome: null,
    amount: null,
    history: null
  });

  const [valid, setValid] = useState(false);
  const [decision, setDecision] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [lang, setLang] = useState('en');

  const fetchData = () =>
    axios.get(`/data`).then(({ data }) => {
      if (decision !== null) {
        buildCollapsibleTree(data);
        buildRadialTidyTree(data);
      }
      setLoaded(true);
    });

  useEffect(() => {
    promiseRetry(function(retry) {
      return fetchData().catch(retry);
    });
  }, [fetchData]);

  const validate = () => {
    if (Object.values(state).every(x => x !== null && Boolean(x))) setValid(true);
    else setValid(false);
  };

  useEffect(() => {
    validate();
  });

  const handleChange = param => event => {
    setState({
      ...state,
      [param]: event.target.value
    });
  };

  const sendData = () => {
    axios.post(`/data`, state).then(({ data }) => {
      setDecision(data);
    });
  };

  const handleChangeLang = () => {
    if (lang === 'en') {
      setLang('ru');
    } else setLang('en');
  };

  return loaded ? (
    <div className="container">
      <AppBar position="static" id="hideOnPrint">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            {i18n.title[lang]}
          </Typography>
          <Fab
            color="secondary"
            aria-label="add"
            style={{ position: 'absolute', top: 16, right: 40 }}
            onClick={handleChangeLang}
          >
            {i18n.fab[lang]}
          </Fab>
        </Toolbar>
      </AppBar>

      <Grid container direction="row" justify="flex-start" alignItems="flex-start">
        <FormControl className={classes.formControl}>
          <InputLabel>{i18n.married[lang]}</InputLabel>
          <Select
            native
            value={state.married || ''}
            onChange={handleChange('married')}
            autoWidth
          >
            <option value="" />
            <option value={1}>{i18n.marriedTrue[lang]}</option>
            <option value={0}>{i18n.marriedFalse[lang]}</option>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel>{i18n.dependents[lang]}</InputLabel>
          <Select
            native
            value={state.dependents || ''}
            onChange={handleChange('dependents')}
          >
            <option value="" />
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3+</option>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel>{i18n.education[lang]}</InputLabel>
          <Select
            native
            value={state.education || ''}
            onChange={handleChange('education')}
          >
            <option value="" />
            <option value={1}>{i18n.educationTrue[lang]}</option>
            <option value={0}>{i18n.educationFalse[lang]}</option>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel>{i18n.selfEmployed[lang]}</InputLabel>
          <Select
            native
            value={state.selfEmployed || ''}
            onChange={handleChange('selfEmployed')}
          >
            <option value="" />
            <option value={1}>{i18n.selfEmployedTrue[lang]}</option>
            <option value={0}>{i18n.selfEmployedFalse[lang]}</option>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel>{i18n.creditHistory[lang]}</InputLabel>
          <Select native value={state.history || ''} onChange={handleChange('history')}>
            <option value="" />
            <option value={1}>{i18n.creditHistoryTrue[lang]}</option>
            <option value={0}>{i18n.creditHistoryFalse[lang]}</option>
          </Select>
        </FormControl>
      </Grid>

      <Grid container direction="row" justify="flex-start" alignItems="flex-start">
        <TextField
          type="number"
          className={classes.textField}
          margin="normal"
          value={state.income || ''}
          label={i18n.income[lang]}
          onChange={handleChange('income')}
        />
        <TextField
          type="number"
          className={classes.textField}
          margin="normal"
          value={state.coapplicantIncome || ''}
          label={i18n.coapplicantIncome[lang]}
          onChange={handleChange('coapplicantIncome')}
        />
        <TextField
          type="number"
          className={classes.textField}
          margin="normal"
          value={state.amount || ''}
          label={i18n.amount[lang]}
          onChange={handleChange('amount')}
        />
      </Grid>

      <Button
        id="hideOnPrint"
        style={{ margin: '20px 24px' }}
        variant="contained"
        color="primary"
        disabled={!valid}
        onClick={() => sendData()}
      >
        {i18n.checkButton[lang]}
      </Button>

      {decision !== null && (
        <>
          <Card className={classes.card}>
            <CardContent>
              {decision === false ? (
                <>
                  <CancelIcon />
                  <Typography gutterBottom variant="h5" component="h2">
                    {i18n.loanRejected[lang]}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircleIcon />
                  <Typography gutterBottom variant="h5" component="h2">
                    {i18n.loanResolved[lang]}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <ExpansionPanel id="hideOnPrint">
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography className={classes.heading}>
                {i18n.collapsibleTree[lang]}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ overflow: 'scroll', display: 'block' }}>
              <svg id="collapsibleTree" />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          <ExpansionPanel id="forPrint">
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography className={classes.heading}>{i18n.radialTree[lang]}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails id="forPrint">
              <svg width={1000} height={1000} id="radialTidyTree" />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </>
      )}
    </div>
  ) : (
    <Loader />
  );
}

export default App;
