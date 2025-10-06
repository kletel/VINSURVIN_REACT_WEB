import React, { useState } from "react";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../config/config";
import authHeader from '../config/authHeader';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("pass", newPassword);

      const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_resetPass`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réinitialisation du mot de passe.");
      }

      const data = await response.json();

      if (data.entete === "succes") {
        setMessage(data.message || "Mot de passe modifié avec succès !");
        setError("");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Une erreur est survenue.");
        setMessage("");
      }
    } catch (err) {
      setError("Une erreur est survenue.");
      setMessage("");
    }
  };

  return (
    <div className="login-container pageSidebar">
      <Paper className="login-box" elevation={3}>
        <Typography variant="h4" className="login-title">Réinitialiser le mot de passe</Typography>
        {message && <Typography color="primary">{message}</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            label="Nouveau mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Réinitialiser
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ResetPassword;