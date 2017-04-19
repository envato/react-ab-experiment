import React from 'react'

class Experiment extends React.Component {
  constructor(props) {
    super(props)
    this.experimentId = this.props.id
    this.variantComponents = this.props.children.filter((child) => {
      return child.type.displayName == "Variant"
    })
    this.loadingComponent = this.props.children.find((child) => {
      return child.type.displayName == "Loading"
    })

    this.state = {
      loading: true,
      variant: null
    }
  }

  experimentKey () {
    return `experiment_${this.experimentId}`
  }

  cacheGet (experimentKey) {
    if (typeof this.props.cacheGet == "undefined"){
      return null
    } else {
      return this.props.cacheGet(experimentKey)
    }
  }

  cacheSet (experimentKey, variantName) {
    return this.props.cacheSet && this.props.cacheSet(experimentKey, variantName)
  }

  fetchVariantName() {
    return this.props.fetchVariantName && this.props.fetchVariantName(this.experimentId)
  }

  chooseRandomVariantName () {
    const randomIndex = Math.floor(Math.random() * (this.variantComponents.length))
    const choosenVariantComponent = this.variantComponents[randomIndex]
    return Promise.resolve(choosenVariantComponent.props.name)
  }

  getVariantName () {
    let variantName = this.cacheGet(this.experimentKey())
    if (variantName == null) {
      return (this.fetchVariantName() || this.chooseRandomVariantName()).then((variantName) => {
        this.props.onEnrolment(this.experimentId, variantName)
        this.cacheSet(this.experimentKey(), variantName)
        return variantName
      })
    } else {
      return Promise.resolve(variantName)
    }
  }

  componentDidMount () {
    this.getVariantName().then((variantName) => {
      const variant = this.variantComponents.find(variant => variant.props.name == variantName)
      this.setState({
        loading: false,
        variant: variant
      })
    })
  }

  render () {
    if (this.state.loading && typeof this.loadingComponent !== "undefined") {
      return this.loadingComponent
    }

    return this.state.variant
  }
}

Experiment.propTypes = {
  id:               React.PropTypes.string.isRequired,
  onEnrolment:      React.PropTypes.func.isRequired,
  fetchVariantName: React.PropTypes.func,
  cacheGet:         React.PropTypes.func,
  cacheSet:         React.PropTypes.func
}

const Variant = (props) => {
  return props.children
}

const Loading = (props) => {
  return props.children
}

export {Experiment, Variant, Loading}
