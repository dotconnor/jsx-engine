const View = ({children}) => {
  return (
    <Div>{children}</Div>
  )
}
const Div = ({children}) => {
  return (
    <div>{children}</div>
  )
}
module.exports = () => {
  return (<View children={[<div></div>]}><View><div></div></View></View>)
}