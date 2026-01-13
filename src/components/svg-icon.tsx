const SvgIcon = ({name}:{name:string}) => {
  return (
    <svg className="icon">
      <use xlinkHref={`/images/sprite.svg#${name}`}></use>
    </svg>
  );
};

export default SvgIcon;