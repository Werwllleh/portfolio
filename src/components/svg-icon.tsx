const SvgIcon = ({name}:{name:string}) => {
  return (
    <svg className="h-full w-full fill-current" aria-hidden="true">
      <use href={`/images/sprite.svg#${name}`}></use>
    </svg>
  );
};

export default SvgIcon;