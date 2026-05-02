export const MyReports = (): React.ReactElement => {
  const navItems = [
    {
      label: "Main Page",
      icon: "https://c.animaapp.com/1VzKHnc8/img/material-symbols-light-home-outline-rounded.svg",
      alt: "Material symbols",
    },
    {
      label: "Map View",
      icon: "https://c.animaapp.com/1VzKHnc8/img/material-symbols-light-map-outline-rounded.svg",
      alt: "Material symbols",
    },
    {
      label: "My Reports",
      icon: "https://c.animaapp.com/1VzKHnc8/img/oui-nav-reports.svg",
      alt: "Oui nav reports",
    },
    {
      label: "Messages",
      icon: "https://c.animaapp.com/1VzKHnc8/img/tabler-messages.svg",
      alt: "Tabler messages",
    },
    {
      label: "Bookmark",
      icon: "https://c.animaapp.com/1VzKHnc8/img/material-symbols-light-bookmark-outline-rounded.svg",
      alt: "Material symbols",
    },
    {
      label: "Logout",
      icon: "https://c.animaapp.com/1VzKHnc8/img/logout-1@2x.png",
      alt: "Logout",
      isSmall: true,
    },
  ];

  const _filterButtons = [
    { label: "Lost", bg: "bg-[#ff0000]", left: "left-[372px]" },
    { label: "Found", bg: "bg-[#14ae5c]", left: "left-[502px]" },
    { label: "Electronics", bg: "", left: "left-[632px]" },
    { label: "Personal Things", bg: "", left: "left-[762px]" },
  ];

  const gpsMarkers = [
    { top: "top-[508px]", left: "left-[640px]" },
    { top: "top-[566px]", left: "left-[1054px]" },
    { top: "top-[841px]", left: "left-[592px]" },
    { top: "top-[801px]", left: "left-[944px]" },
    { top: "top-[512px]", left: "left-[839px]" },
  ];

  return (
    <div className="bg-white overflow-hidden w-full min-w-[1440px] h-[1024px] relative">
      {/* Background shadow overlay */}
      <div className="absolute top-[149px] -left-1.5 w-[305px] h-[881px] bg-white shadow-[0px_4px_4px_3px_#00000040]" />

      {/* Navigation Sidebar */}
      <div className="absolute top-[222px] left-[109px] flex flex-col gap-[41px]">
        {navItems.map((item, index) => (
          <div key={index} className="relative w-[72px] h-[18px]">
            <div className="absolute top-0 left-0 font-light text-black text-[15px] font-['Roboto',Helvetica] tracking-[0] leading-normal whitespace-nowrap">
              {item.label}
            </div>

            <img
              className={`absolute ${item.isSmall ? "w-7 h-7 object-cover" : "w-11 h-11"} aspect-[1]`}
              alt={item.alt}
              src={item.icon}
            />
          </div>
        ))}
      </div>

      {/* Vector Background */}
      <img
        className="absolute w-[74.03%] h-[80.47%] top-[19.53%] left-[25.97%]"
        alt="Vector"
        src="https://c.animaapp.com/1VzKHnc8/img/vector.svg"
      />

      {/* Main Map Image */}
      <img
        className="absolute top-0 left-0 w-[1440px] h-[1024px]"
        alt="Untitled design"
        src="https://c.animaapp.com/1VzKHnc8/img/untitled-design--8--1.png"
      />

      {/* My Reports Title */}
      <div className="absolute top-[206px] left-[417px] inline-flex items-center justify-center gap-2.5">
        <div className="font-semibold text-black text-[25px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
          My Reports
        </div>
      </div>

      {/* Separator Line */}
      <img
        className="absolute top-[354px] left-[372px] w-[463px] h-px object-cover"
        alt="Line"
        src="https://c.animaapp.com/1VzKHnc8/img/line-1.svg"
      />

      {/* Filters Section */}
      <div className="absolute top-[275px] left-[372px]">
        <div className="font-semibold text-black text-xl font-['Roboto',Helvetica] tracking-[0] leading-normal">
          Filters
        </div>
      </div>

      {/* Filter Colored Boxes */}
      {_filterButtons.map((btn, index) => (
        <div
          key={index}
          className={`absolute top-[304px] ${btn.left} w-[111px] h-[31px] rounded-[25px] border border-solid border-black ${btn.bg}`}
        />
      ))}

      {/* Filter Labels */}
      <div className="absolute top-[304px] left-[413px] font-light text-black text-[15px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
        Lost
      </div>
      <div className="absolute top-[304px] left-[533px] font-light text-black text-[15px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
        Found
      </div>
      <div className="absolute top-[304px] left-[651px] font-light text-black text-[15px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
        Electronics
      </div>
      <div className="absolute top-[304px] left-[781px] font-light text-black text-[15px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
        Personal Things
      </div>

      {/* Additional UI Elements (from later screenshots) */}
      <img
        className="absolute top-[939px] left-0 w-[162px] h-[70px] aspect-[2.65] object-cover"
        alt="Untitled design"
        src="https://c.animaapp.com/1VzKHnc8/img/untitled-design--15--1@2x.png"
      />

      <img
        className="absolute top-[14px] left-[69px] w-[165px] h-[74px] aspect-[2.22] object-cover"
        alt="Untitled design"
        src="https://c.animaapp.com/1VzKHnc8/img/untitled-design--6--3@2x.png"
      />

      {/* Daily Update */}
      <div className="absolute top-[266px] left-[1007px] inline-flex items-center justify-center gap-2.5">
        <div className="font-semibold text-black text-[25px] font-['Roboto',Helvetica] tracking-[0] leading-normal">
          Daily Update
        </div>
      </div>

      {/* BSU MAP Label */}
      <div className="absolute top-[590px] left-[781px] font-semibold text-black text-[70px] font-['Roboto',Helvetica] tracking-[0] leading-[normal]">
        BSU MAP
      </div>

      {/* GPS Markers */}
      <div className="absolute top-0 left-0 w-full h-full">
        {gpsMarkers.map((marker, index) => (
          <img
            key={index}
            className={`absolute ${marker.top} ${marker.left} w-6 h-6 aspect-[1]`}
            alt="Solar gps bold"
            src="https://c.animaapp.com/1VzKHnc8/img/solar-gps-bold-4.svg"
          />
        ))}
      </div>

      {/* Other images from the design (you can add more as needed) */}
      {/* Example: Name, SR-Code, etc. can be added similarly with absolute positioning */}

    </div>
  );
};