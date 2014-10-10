# Automated REST client for the routing-service API

This is *not* a test suite! (though it uses all the tools you'd normally use in a test suite)

## How to use:
```
npm install
scripts/reset.sh
```

Make sure you're online. Then run something like

```
npm test
```

or

```
mocha --recursive -R spec -g "payment"
```