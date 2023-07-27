import { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Link,
  Box,
  AppBar,
  Toolbar,
  Container,
  MenuItem,
} from '@mui/material';
import {
  protectDataFunc,
  grantAccessFunc,
  revokeAccessFunc,
} from './protectDataFunc';
import { sendMail } from "./protectedMailFunc";
import Connect from './Connect';
import { useAccount, useDisconnect } from 'wagmi';
import { IEXEC_EXPLORER_URL } from '../utils/config';
import { DataSchema, GrantedAccess } from '@iexec/dataprotector';

export default function Front() {
  //web3mail dapp END
  const WEB3MAIL_APP_ENS = 'web3mail.apps.iexec.eth';
  //connection with wallet
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  //loading effect & error
  const [loadingProtect, setLoadingProtect] = useState(false);
  const [errorProtect, setErrorProtect] = useState('');
  const [loadingGrant, setLoadingGrant] = useState(false);
  const [errorGrant, setErrorGrant] = useState('');
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [errorRevoke, setErrorRevoke] = useState('');

  //global state
  const [protectedData, setProtectedData] = useState('');
  const [grantAccess, setGrantAccess] = useState<GrantedAccess>();
  const [revokeAccess, setRevokeAccess] = useState('');

  //set name
  const [name, setName] = useState('');

  //set email
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);

  // preferences 
  const [interests, setInterests] = useState('');

  //set access number
  const [accessNumber, setAccessNumber] = useState<number>(1);

  //set user restricted address
  // const [authorizedUser, setAuthorizedUser] = useState('');

  // set campaigns
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  //handle functions
  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setIsValidEmail(event.target.validity.valid);
  };

  const handleNameChange = (event: any) => {
    setName(event.target.value);
  };

  const handleProtectedDataChange = (event: any) => {
    setProtectedData(event.target.value);
  };

  const handleAccessNumberChange = (event: any) => {
    setAccessNumber(event.target.value);
  };

  // const authorizedUserChange = (event: any) => {
  //   setAuthorizedUser(event.target.value);
  // };

  const handleCampaignChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCampaign(event.target.value as string);
  };

  const handleInterestsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInterests(event.target.value);
  };

  //handle Submit
  const protectedDataSubmit = async () => {
    setErrorProtect('');
    if (email) {
      const data: DataSchema = { email: email, preferencesAndInterests: interests } as DataSchema;
      try {
        setLoadingProtect(true);
        const ProtectedDataAddress = await protectDataFunc(data, name);
        setProtectedData(ProtectedDataAddress);
        setErrorProtect('');
      } catch (error) {
        setErrorProtect(String(error));
      }
      setLoadingProtect(false);
    } else {
      setErrorProtect('Please enter a valid email address');
    }
  };


  useEffect(() => {
    fetchCampaigns();
  }, []);


  const fetchCampaigns = async () => {
    try {
      const campaignAddresses = await yourContract.getCampaings();
      setCampaigns(campaignAddresses);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const grantAccessSubmit = async () => {
    setErrorGrant('');
    try {
      setLoadingGrant(true);
      const accessHash = await grantAccessFunc(
        protectedData,
        selectedCampaign, // Use the selected campaign address as the authorized user
        WEB3MAIL_APP_ENS,
        accessNumber
      );
      setErrorGrant('');
      setGrantAccess(accessHash);
      await sendEmail();
    } catch (error) {
      setErrorGrant(String(error));
      setGrantAccess(undefined);
    }
    setLoadingGrant(false);
  };


  const revokeAccessSubmit = async () => {
    setRevokeAccess('');
    try {
      setLoadingRevoke(true);
      const tx = await revokeAccessFunc(
        protectedData,
        selectedCampaign,
        WEB3MAIL_APP_ENS
      );
      setRevokeAccess(tx);
    } catch (error) {
      setErrorRevoke(String(error));
      setRevokeAccess('');
    }
    setLoadingRevoke(false);
  };

  //wallet address shortening
  const shortAddress = (address: string) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const sendEmail = async () => {
    const campaignInfo = await fetchCampaignInfo(selectedCampaign);

    // Extract campaign information from the fetched data
    const { emailSubject, emailContent } = campaignInfo;
    sendMail(emailSubject, emailContent, protectedData);
  };

  const fetchCampaignInfo = async (campaignAddress: string) => {
    // Implement logic to interact with the contract and fetch campaign details based on the campaignAddress
    // Return the campaign information (emailSubject, emailContent) from the contract
    const campaignInfo = await yourContract.getCampaignInfoByAddress(campaignAddress);
    return campaignInfo;
  };


  return (
    <Container disableGutters>
      {isConnected ? (
        <>
          {/**App bar for wallet connection*/}
          <AppBar
            position="static"
            elevation={0}
            sx={{ backgroundColor: 'transparent', width: '100%' }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Typography
                sx={{
                  flexGrow: 1,
                  textAlign: 'right',
                  mr: 2,
                  fontStyle: 'italic',
                }}
              >
                {shortAddress(address as string)}
              </Typography>
              <Button variant="contained" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </Toolbar>
          </AppBar>
          {/**First Box to create a Protected Data*/}
          <Box id="form-box">
            <Typography component="h1" variant="h5" sx={{ mt: 3 }}>
              Protect your data
            </Typography>
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              variant="outlined"
              sx={{ mt: 3 }}
              value={email}
              onChange={handleEmailChange}
              type="email"
              error={!isValidEmail}
              helperText={!isValidEmail && 'Please enter a valid email address'}
            />
            <TextField
              fullWidth
              id="name"
              label="Name"
              variant="outlined"
              value={name}
              onChange={handleNameChange}
              sx={{ mt: 3 }}
            />
            {/* New text field for preferences and interests */}
            <TextField
              fullWidth
              id="preferencesAndInterests"
              label="Preferences and Interests"
              variant="outlined"
              value={interests}
              onChange={handleInterestsChange}
              sx={{ mt: 3 }}
            />
            {errorProtect && (
              <Alert sx={{ mt: 3, mb: 2 }} severity="error">
                <Typography variant="h6"> Creation failed </Typography>
                {errorProtect}
              </Alert>
            )}
            {!loadingProtect && (
              <Button
                sx={{ display: 'block', margin: '20px auto' }}
                onClick={protectedDataSubmit}
                variant="contained"
              >
                Create
              </Button>
            )}
            {protectedData && !errorProtect && (
              <Alert sx={{ mt: 3, mb: 2 }} severity="success">
                <Typography variant="h6">
                  Your data has been protected!
                </Typography>
                <Link
                  href={IEXEC_EXPLORER_URL + protectedData}
                  target="_blank"
                  sx={{ color: 'green', textDecorationColor: 'green' }}
                >
                  You can reach it here
                </Link>
                <p>Your protected data address: {protectedData}</p>
              </Alert>
            )}
            {loadingProtect && (
              <CircularProgress
                sx={{ display: 'block', margin: '20px auto' }}
              ></CircularProgress>
            )}
          </Box>
          {/**Second Box to grant access to a Protected Data */}
          {protectedData && (
            <Box id="form-box">
              <Typography component="h1" variant="h5" sx={{ mt: 3 }}>
                Grant Access for your protected data
              </Typography>
              <TextField
                required
                fullWidth
                label="Data Address"
                variant="outlined"
                sx={{ mt: 3 }}
                value={protectedData}
                onChange={handleProtectedDataChange}
                type="text"
              />
              <TextField
                fullWidth
                type="number"
                id="age"
                label="Access Number"
                variant="outlined"
                value={accessNumber}
                InputProps={{ inputProps: { min: 1 } }}
                onChange={handleAccessNumberChange}
                sx={{ mt: 3 }}
              />
              {/* <TextField
                fullWidth
                id="authorizedUser"
                label="User Address Restricted"
                variant="outlined"
                sx={{ mt: 3 }}
                value={authorizedUser}
                onChange={authorizedUserChange}
                type="text"
              /> */}
              {/* Dropdown menu for selecting campaigns */}
              <TextField
                select
                fullWidth
                label="Select Campaign"
                variant="outlined"
                sx={{ mt: 3 }}
                value={selectedCampaign}
                onChange={handleCampaignChange}
              >
                {campaigns.map((campaignAddress) => (
                  <MenuItem key={campaignAddress} value={campaignAddress}>
                    {campaignAddress}
                  </MenuItem>
                ))}
              </TextField>
              {!loadingGrant && (
                <Button
                  id="spacingStyle"
                  onClick={grantAccessSubmit}
                  variant="contained"
                >
                  Grant Access
                </Button>
              )}
              {errorGrant && (
                <Alert sx={{ mt: 3, mb: 2 }} severity="error">
                  <Typography variant="h6"> Grant Access failed </Typography>
                  {errorGrant}
                </Alert>
              )}
              {grantAccess && !errorGrant && (
                <>
                  <Alert sx={{ mt: 3, mb: 2 }} severity="success">
                    <Typography variant="h6">
                      Your access has been granted !
                    </Typography>
                  </Alert>
                </>
              )}
              {loadingGrant && (
                <CircularProgress id="spacingStyle"></CircularProgress>
              )}
            </Box>
          )}
          {/**Third Box to revoke the access given to a Protected Data*/}
          {grantAccess && (
            <Box id="form-box">
              <Typography component="h1" variant="h5" sx={{ mt: 3 }}>
                Revoke Access For Your data
              </Typography>
              <TextField
                required
                fullWidth
                id="dataorderAddresssetAddress"
                label="Data Address"
                variant="outlined"
                sx={{ mt: 3 }}
                value={protectedData}
                onChange={handleProtectedDataChange}
                type="text"
              />
              {!loadingRevoke && (
                <Button
                  id="spacingStyle"
                  onClick={revokeAccessSubmit}
                  variant="contained"
                >
                  Revoke Access
                </Button>
              )}
              {loadingRevoke && (
                <CircularProgress id="spacingStyle"></CircularProgress>
              )}
              {revokeAccess && !errorRevoke && (
                <>
                  <Alert sx={{ mt: 3, mb: 2 }} severity="success">
                    <Typography variant="h6">
                      You have successfully revoked access!
                    </Typography>
                  </Alert>
                </>
              )}
              {errorRevoke && (
                <Alert sx={{ mt: 3, mb: 2 }} severity="error">
                  <Typography variant="h6"> Revoke Access failed </Typography>
                  {errorRevoke}
                </Alert>
              )}
            </Box>
          )}
        </>
      ) : (
        <Connect />
      )}
    </Container>
  );
}
