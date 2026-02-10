const SvgIcon = ({name}:{name:string}) => {
  return (
    <svg className="icon">
      <use href={`/images/sprite.svg#${name}`}></use>
    </svg>
  );
};

export default SvgIcon;