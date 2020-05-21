function Div({ children }) {
  return <div>{children}</div>;
}

function View({ children }) {
  return <Div>{children}</Div>;
}

module.exports = () => {
  return (
    <View>
      <View>
        <div />
      </View>
    </View>
  );
};
