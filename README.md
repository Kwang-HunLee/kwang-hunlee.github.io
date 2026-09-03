# kwang-hunlee.github.io

Personal academic website of **Kwang-Hun Lee** — postdoctoral researcher at the POSTECH Environmental Research Institute (Ph.D., POSTECH, Aug 2026).

🌐 Live site: https://kwang-hunlee.github.io

## Research

- Big-data analytics on national reservoir networks (rPCA, ~3,300 reservoirs)
- USV-based high-resolution reservoir monitoring (Daljeon, 5 yr / 100+ surveys)
- USV + UAV + Sentinel-2 multi-platform fusion with explainable AI
- Toward a global inland-water observatory


## Drought monitor

Daily **scEDI** (spatially continuous Effective Drought Index) maps for South Korea:

- Live page: https://kwang-hunlee.github.io/drought/
- Source: `drought/index.html` + `drought/drought.js`
- Published figures live under `drought/data/<YYYY-MM-DD>/`
- Catalog: `drought/data/index.json` (newest dates first)

### Publish a new day

```bash
python drought/scripts/publish_day.py 2026-09-03
# or point at an export folder:
python drought/scripts/publish_day.py 2026-09-03 /path/to/exports
```

Expected PNGs:

- `scEDI_PREC_VDD_AWRI_2x2_<date>.png`
- `scEDI_contour_DEM_<date>.png`
- `Province_scEDI_map_<date>.png` (optional)

Then commit the updated `drought/data/` files and push.

## Stack

Plain HTML / CSS / JS — no framework, no build step.

## Local preview

```bash
open index.html
```

## Contact

lkh322@postech.ac.kr
