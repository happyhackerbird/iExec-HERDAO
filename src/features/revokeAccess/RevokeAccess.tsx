import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import revokeAccessFunc from "./revokeAccessFunc";
import { isAddress } from "ethers/lib/utils.js";
import { useAppSelector } from "../../app/hooks";
import {
  selectProtectedDataCreated,
  selectUserAddressRestricted,
} from "../../app/appSlice";
import { NULL_ADDRESS } from "../../utils/constant";

export default function RevokeAccess() {
  //global state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [revokeAccess, setRevokeAccess] = useState<string>();
  const grantAccessAddress = useAppSelector(selectProtectedDataCreated);
  const authorizedUser = useAppSelector(selectUserAddressRestricted);

  //for order state
  const [protectedData, setProtectedData] = useState(grantAccessAddress);
  const [isValidProtectedData, setIsValidProtectedData] = useState(true);

  //handle function
  const handleOrderAddressChange = (event: any) => {
    setProtectedData(event.target.value);
    setIsValidProtectedData(isAddress(event.target.value));
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const tx = await revokeAccessFunc(
        protectedData,
        authorizedUser,
        NULL_ADDRESS
      );
      setRevokeAccess(tx);
    } catch (error) {
      setError(String(error));
      setRevokeAccess("");
    }
    console.log(protectedData);
    setLoading(false);
  };
  return (
    <Box className="form-box">
      <TextField
        required
        fullWidth
        id="dataorderAddresssetAddress"
        label="Data Address"
        variant="outlined"
        sx={{ mt: 3 }}
        value={protectedData}
        onChange={handleOrderAddressChange}
        type="text"
        error={!isValidProtectedData}
        helperText={
          !isValidProtectedData && "Please enter a valid protectedData address"
        }
      />
      {!loading && (
        <Button
          sx={{ display: "block", margin: "20px auto" }}
          onClick={handleSubmit}
          variant="contained"
        >
          Revoke Access
        </Button>
      )}
      {loading && (
        <CircularProgress
          sx={{ display: "block", margin: "20px auto" }}
        ></CircularProgress>
      )}
      {revokeAccess && !error && (
        <>
          <Alert sx={{ mt: 3, mb: 2 }} severity="success">
            <Typography variant="h6">
              You have successfully revoke access!
            </Typography>
          </Alert>
        </>
      )}
      {error && (
        <Alert sx={{ mt: 3, mb: 2 }} severity="error">
          <Typography variant="h6"> Revoke Access failed </Typography>
          {error}
        </Alert>
      )}
    </Box>
  );
}
