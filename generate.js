const fs = require('fs-extra')
const path = require('path')
const mdnDataDir = path.dirname(require.resolve('mdn-data'))

const processFiles = () => {
  const mdnAnimatableProperties = {}
  const nonAnimatableProperties = {}
  const filteredSyntaxes = {}
  const syntaxes = {}
  const syntaxesMdn = {}
  const mdnProperties = JSON.parse(fs.readFileSync(path.join(__dirname, 'css', 'properties.json'), 'utf8'))
  const mdnSyntaxes = JSON.parse(fs.readFileSync(path.join(__dirname, 'css', 'syntaxes.json'), 'utf8'))

  const getMatches = (property) => {
    const matches = mdnProperties[property]['syntax'].match(/<[a-zA-Z0-9-()]+>/g)
    if (Array.isArray(matches)) {
      matches.forEach((key) => {
        syntaxes[key.slice(1, -1)] = true
      })
    }
  }

  // Include some non-animatable properties in order not to break syntax validation
  const getNonAnimatableProperties = (property) => {
    // Detect non-animatable properties which should be included in syntaxes
    const additionalMatches = mdnProperties[property]['syntax'].match(/<'[a-zA-Z0-9-()]+'>/g)
    if (Array.isArray(additionalMatches)) {
      additionalMatches.forEach((ke) => {
        const prop = ke.slice(2, -2)
        if (mdnProperties[prop].animationType === 'discrete') {
          if (nonAnimatableProperties[prop] !== true) {
            nonAnimatableProperties[prop] = true
            getMatches(prop)
            getNonAnimatableProperties(prop)
          }
        }
      })
    }
  }

  // Filter out all properties except animatable
  Object.keys(mdnProperties).forEach((key) => {
    if (key.charAt(0) !== '-' && mdnProperties[key].animationType !== 'discrete') {
      mdnAnimatableProperties[key] = { syntax: mdnProperties[key]['syntax'] }
      // Filter out all syntaxes except used in animatable properties
      getNonAnimatableProperties(key)
      getMatches(key)
    }
  })

  Object.keys(nonAnimatableProperties).forEach((key) => {
    mdnAnimatableProperties[key] = { syntax: mdnProperties[key]['syntax'] }
  })
  ;[path.join(__dirname, 'css', 'at-rules.json')].forEach((value) => {
    if (fs.existsSync(value)) {
      const stream = fs.createWriteStream(value)
      stream.once('open', () => {
        stream.write(`{}\n`)
        stream.end()
      })
    }
  })
  ;[path.join(__dirname, 'css', 'properties.json')].forEach((value) => {
    if (fs.existsSync(value)) {
      const stream = fs.createWriteStream(value)
      stream.once('open', () => {
        stream.write(`${JSON.stringify(mdnAnimatableProperties)}\n`)
        stream.end()
      })
    }
  })

  // Filter out all syntaxes except used in animatable properties
  const getSyntaxes = (syntaxes) => {
    Object.keys(syntaxes).forEach((key) => {
      if (Object.keys(mdnSyntaxes).includes(key)) {
        syntaxesMdn[key] = true
        const matches = mdnSyntaxes[key]['syntax'].match(/<[a-zA-Z0-9-()]+>/g)
        if (Array.isArray(matches)) {
          matches.forEach((key) => {
            if (syntaxesMdn[key.slice(1, -1)] !== true) {
              const syntax = {}
              syntax[key.slice(1, -1)] = true
              syntaxesMdn[key.slice(1, -1)] = true
              getSyntaxes(syntax)
            }
          })
        }
      }
    })
  }
  getSyntaxes(syntaxes)
  Object.keys(mdnSyntaxes).forEach((key) => {
    if (Object.keys(syntaxesMdn).includes(key)) {
      filteredSyntaxes[key] = mdnSyntaxes[key]
    }
  })
  ;[path.join(__dirname, 'css', 'syntaxes.json')].forEach((value) => {
    if (fs.existsSync(value)) {
      const stream = fs.createWriteStream(value)
      stream.once('open', () => {
        stream.write(`${JSON.stringify(filteredSyntaxes)}\n`)
        stream.end()
      })
    }
  })
}

fs.readdirSync(mdnDataDir).forEach((file) => {
  if (fs.lstatSync(path.join(mdnDataDir, file)).isDirectory()) {
    fs.copy(path.join(mdnDataDir, file), path.join(__dirname, file))
      .then(() => {
        if (file === 'css') {
          processFiles()
        }
      })
      .catch((err) => console.error(file, err))
  }
})
