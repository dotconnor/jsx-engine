const Div = ({ children }) => {
  return <div>{children}</div>;
};

const View = ({ children }) => {
  return <Div>{children}</Div>;
};

module.exports = () => {
  return (
    <View>
      <View>
        <div></div>
      </View>
    </View>
  );
};
