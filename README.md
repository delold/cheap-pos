# cheap-pos
POS for those, who are looking for best value-per-price system. Targetted primarily for Raspberry PI (using py client). 

This project is mainly for encouraging other DIY solutions. Also, as an open-source implementation of the future state-based record tracking (oh god...)

# run the server
The server is running at port 5116 by default.
```
npm install
npm start
```

# run python client
Python 3.4+ with Tk/Ttk support required.
```
python ./python/client.py
```

# browser client
After running the server, visit `/client` in your browser.

Alternatively, you can start `nwjs` with the help of `gulp`
```
gulp run
```
