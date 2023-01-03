import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/joy/Box';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import TextField from '@mui/joy/TextField';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';

export default function App() {
  let [refreshActive, setRefreshActive] = useState(true);
  let [steamid, setSteamId] = useState(76561198027916204);
  let [token, setToken] = useState(' ');
  let [timeout, setTimeoutValue] = useState(10);
  let [count, setCount] = useState(100);

  const [logs, setLogs] = useState([]);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const SendRefreshRequest = async (steamid, token, timeout, count) => {
    setRefreshActive(false)
    let logsCopy = logs
    for (let i = 0; i < count; i++) {
      await fetch(`https://backpack.tf/api/inventory/${steamid}/refresh?token=${token}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(response => {
          if (response.status == 200) {
            logsCopy = [...logsCopy, { text: `Refresh request successful, next update in ${response.body.next_update - response.body.current_time}s`, color: "success" }]
          } else {
            logsCopy = [...logsCopy, { text: `Request failed, Error code: ${response.status}, Text: ${response.text}`, color: "danger" }]
          }
          setLogs(logsCopy)
        })

      await sleep(timeout * 1000);
    }
    setRefreshActive(true)
  }

  return (
    <CssVarsProvider defaultMode="dark">
      <main>
        <Box
          sx={{
            bgcolor: 'background.body',
            flexGrow: 1,
            height: '100vh',
            overflowX: 'hidden',
            borderRadius: 'none',
          }}
        >
          <Box
            sx={{
              my: 0, // margin top & botom
              mx: 4,
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          >
            <Sheet
              sx={{
                width: 300,
                height: 'fit-content',
                mx: 'auto', // margin left & right
                my: 4, // margin top & botom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'sm',
              }}
              variant="soft"
            >
              <div>
                <Typography level="h4" component="h1">
                  <b>spammer</b>
                </Typography>
              </div>
              <TextField
                name="steamid"
                type="text"
                placeholder="76561198027916204"
                label="steamid"
                onChange={(text) => { setSteamId(text.target.value) }}
              />
              <TextField
                name="token"
                type="password"
                placeholder=""
                label="Token"
                onChange={(text) => { setToken(text.target.value) }}
              />
              <TextField
                name="timeout"
                type="number"
                placeholder="10"
                label="Timeout"
                onChange={(text) => { setTimeoutValue(text.target.value) }}
              />
              <TextField
                name="count"
                type="number"
                placeholder="100"
                label="Count"
                onChange={(text) => { setCount(text.target.value) }}
              />

              <Button disabled={!refreshActive} loading={!refreshActive} onClick={() => { SendRefreshRequest(steamid, token, timeout, count) }} sx={{ mt: 1 /* margin top */ }}>Refresh</Button>
            </Sheet>

            <Sheet
              sx={{
                width: '100%',
                height: 'fit-content',
                mx: 'auto', // margin left & right
                my: 4, // margin top & botom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: 'flex',
                flexDirection: 'column',
                gap: .4,
                borderRadius: 'sm',
                boxShadow: 'sm',
              }}
              variant="outlined"
            >
              <div>
                <Typography level="h4" component="h1">
                  <b>logs</b>
                </Typography>
              </div>

              {logs.map(log => {
                return (
                  <Sheet
                    sx={{
                      width: '100%',
                      height: 'fit-content',
                      mx: 'auto', // margin left & right
                      px: '10px',
                      borderRadius: 'sm',
                      boxShadow: 'sm',
                    }}
                    variant="soft"
                    color={log.color}
                  >
                    <div>
                      <Typography>
                        {log.text}
                      </Typography>
                    </div>
                  </Sheet>)
              })}
              <Button disabled={!refreshActive} loading={!refreshActive} onClick={() => { setLogs([]) }} sx={{ width: 'fit-content', mt: 1 /* margin top */ }}>Clear logs</Button>
            </Sheet>
          </Box>
        </Box>
      </main>
    </CssVarsProvider>
  );
}