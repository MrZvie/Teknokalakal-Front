export default function Center({className="max-w-[800px] my-0 mx-auto] py-0 px-5 mx-auto",style = {},children}) {
    return (
    //   this compoent is really useless but why not hahaha
    // ito sana yung magiging component sa baba ng nav 
        <div className={className} style={style} >{children}</div>
    );
}