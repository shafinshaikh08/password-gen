import { LinearProgress, Typography, Box } from '@mui/material';

const calculateStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  return strength;
};

export default function StrengthMeter({ password }) {
  const strength = calculateStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const color = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5"];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography>Strength: {strengthLabels[strength - 1] || "Too Short"}</Typography>
      <LinearProgress
        variant="determinate"
        value={(strength / 5) * 100}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color[strength - 1] || '#e0e0e0'
          }
        }}
      />
    </Box>
  );
}
